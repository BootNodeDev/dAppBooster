import { useMemo } from 'react'

import {
  EVM,
  type TokenAmount,
  type TokensResponse,
  createConfig,
  getChains,
  getTokenBalances,
  getTokens,
} from '@lifi/sdk'
import { useQuery } from '@tanstack/react-query'
import { type Address, type Chain, formatUnits } from 'viem'

import { env } from '@/src/env'
import { useTokenLists } from '@/src/hooks/useTokenLists'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import type { Token, Tokens } from '@/src/types/token'
import { logger } from '@/src/utils/logger'
import type { TokensMap } from '@/src/utils/tokenListsCache'

const BALANCE_EXPIRATION_TIME = 32_000

/** @ignore */
export const lifiConfig = createConfig({
  integrator: env.PUBLIC_APP_NAME,
  providers: [EVM()],
})

/**
 * Custom hook for fetching and managing tokens data with price and balances.
 *
 * Combines token list data with real-time price and balance information from LI.FI SDK.
 * Features include:
 * - Token data fetching from token lists
 * - Balance fetching for specified accounts across multiple chains
 * - Price information retrieval
 * - Automatic sorting by token value (balance × price)
 * - Periodic refetching for up-to-date balances and prices
 *
 * @param {Object} params - Parameters for tokens fetching
 * @param {Address} [params.account] - Account address for balance fetching (defaults to connected wallet)
 * @param {Chain['id']} [params.chainId] - Specific chain ID to filter tokens (defaults to all supported chains)
 * @param {boolean} [params.withBalance=true] - Whether to fetch token balances
 *
 * @returns {Object} Token data and loading state
 * @returns {Token[]} returns.tokens - Array of tokens with price and balance information
 * @returns {Record<number, Token[]>} returns.tokensByChainId - Tokens organized by chain ID
 * @returns {boolean} returns.isLoadingBalances - Loading state for token balances and prices
 *
 * @example
 * ```tsx
 * // Fetch all tokens with balances for connected wallet
 * const { tokens, tokensByChainId, isLoadingBalances } = useTokens();
 *
 * // Fetch tokens for specific chain without balances
 * const { tokens } = useTokens({
 *   chainId: 1,
 *   withBalance: false
 * });
 *
 * // Fetch balances for specific account
 * const { tokens } = useTokens({
 *   account: '0x123...'
 * });
 * ```
 */
export const useTokens = (
  {
    account,
    chainId,
    withBalance,
  }: { account?: Address; chainId?: Chain['id']; withBalance?: boolean } = {
    withBalance: true,
  },
) => {
  const { address } = useWeb3Status()
  const tokensData = useTokenLists()
  account ??= address

  const canFetchBalance = !!account && withBalance

  const { data: chains, isLoading: isLoadingChains } = useQuery({
    queryKey: ['lifi', 'chains'],
    queryFn: () => getChains(),
    staleTime: Number.POSITIVE_INFINITY,
    refetchInterval: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    enabled: canFetchBalance,
  })

  const dAppChainsId = chainId
    ? [chainId]
    : Object.keys(tokensData.tokensByChainId).map((id) => Number.parseInt(id))
  const lifiChainsId = chains?.map((chain) => chain.id) ?? []
  const chainsToFetch = dAppChainsId.filter((id) => lifiChainsId.includes(id))

  const { data: tokensPricesByChain, isLoading: isLoadingPrices } = useQuery({
    queryKey: ['lifi', 'tokens', 'prices', chainsToFetch],
    queryFn: () => getTokens({ chains: chainsToFetch }),
    staleTime: BALANCE_EXPIRATION_TIME,
    refetchInterval: BALANCE_EXPIRATION_TIME,
    gcTime: Number.POSITIVE_INFINITY,
    enabled: canFetchBalance && !!chains,
  })

  const { data: tokensBalances, isLoading: isLoadingBalances } = useQuery({
    queryKey: ['lifi', 'tokens', 'balances', account, chainsToFetch],
    queryFn: () =>
      getTokenBalances(
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        account!,
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        Object.entries(tokensPricesByChain!.tokens)
          .filter(([chainId]) => chainsToFetch.includes(Number.parseInt(chainId)))
          .flatMap(([, tokens]) => tokens),
      ),
    staleTime: BALANCE_EXPIRATION_TIME,
    refetchInterval: BALANCE_EXPIRATION_TIME,
    gcTime: Number.POSITIVE_INFINITY,
    enabled: canFetchBalance && !!tokensPricesByChain,
  })

  const cache = useMemo(() => {
    if (
      withBalance &&
      account &&
      !isLoadingPrices &&
      !isLoadingBalances &&
      tokensBalances &&
      tokensPricesByChain
    ) {
      return udpateTokensBalances(tokensData.tokens, [tokensBalances, tokensPricesByChain])
    }
    return tokensData
  }, [
    account,
    isLoadingBalances,
    isLoadingPrices,
    tokensBalances,
    tokensData,
    tokensPricesByChain,
    withBalance,
  ])

  return {
    ...cache,
    isLoadingBalances: Boolean(isLoadingChains || isLoadingBalances || isLoadingPrices),
  }
}

/**
 * Updates the tokens balances by extending the tokens with balance information and sorting them by balance.
 *
 * @param tokens - The array of tokens.
 * @param results - The results containing the balance tokens and prices.
 * @returns An object containing the updated tokens and tokens grouped by chain ID.
 */
function udpateTokensBalances(tokens: Tokens, results: [Array<TokenAmount>, TokensResponse]) {
  const [balanceTokens, prices] = results

  logger.time('extending tokens with balance info')
  const priceByChainAddress = Object.entries(prices.tokens).reduce(
    (acc, [chainId, tokens]) => {
      acc[chainId] = {}

      // biome-ignore lint/complexity/noForEach: <explanation>
      tokens.forEach((token) => {
        acc[chainId][token.address] = token.priceUSD ?? '0'
      })

      return acc
    },
    {} as { [chainId: string]: { [address: string]: string } },
  )

  const balanceTokensByChain = balanceTokens.reduce(
    (acc, balanceToken) => {
      if (!acc[balanceToken.chainId]) {
        acc[balanceToken.chainId] = {}
      }

      acc[balanceToken.chainId][balanceToken.address] = balanceToken.amount ?? 0n

      return acc
    },
    {} as { [chainId: number]: { [address: string]: bigint } },
  )

  const tokensWithBalances = tokens.map((token): Token => {
    const tokenPrice = priceByChainAddress[token.chainId]?.[token.address] ?? '0'
    const tokenBalance = balanceTokensByChain[token.chainId]?.[token.address] ?? 0n

    return {
      ...token,
      extensions: {
        priceUSD: tokenPrice,
        balance: tokenBalance,
      },
    }
  })
  logger.timeEnd('extending tokens with balance info')

  logger.time('sorting tokens by balance')
  tokensWithBalances.sort(sortFn)
  logger.timeEnd('sorting tokens by balance')

  logger.time('updating tokens cache')
  const tokensByChain = tokensWithBalances.reduce(
    (acc, token) => {
      if (!acc[token.chainId]) {
        acc[token.chainId] = [token]
      } else {
        acc[token.chainId].push(token)
      }
      return acc
    },
    {} as TokensMap['tokensByChainId'],
  )

  return { tokens: tokensWithBalances, tokensByChainId: tokensByChain }
}

/**
 * A sorting function used to sort tokens by balance.
 * @param a The first token.
 * @param b The second token.
 * @returns A negative number if a should be sorted before b, a positive number
 *  if b should be sorted before a, or 0 if they have the same order.
 */
function sortFn(a: Token, b: Token) {
  return (
    Number.parseFloat(formatUnits((b.extensions?.balance as bigint) ?? 0n, b.decimals)) *
      Number.parseFloat((b.extensions?.priceUSD as string) ?? '0') -
    Number.parseFloat(formatUnits((a.extensions?.balance as bigint) ?? 0n, a.decimals)) *
      Number.parseFloat((a.extensions?.priceUSD as string) ?? '0')
  )
}
