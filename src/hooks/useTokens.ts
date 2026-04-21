import {
  createConfig,
  EVM,
  getChains,
  getTokenBalances,
  getTokens,
  type TokenAmount,
  type TokensResponse,
} from '@lifi/sdk'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { type Address, type Chain, erc20Abi, formatUnits, getAddress } from 'viem'
import { usePublicClient } from 'wagmi'

import { env } from '@/src/env'
import { useTokenLists } from '@/src/hooks/useTokenLists'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { lifiRpcUrls } from '@/src/lib/networks.config'
import type { Token, Tokens } from '@/src/types/token'
import { isNativeToken, toLocalNativeAddress } from '@/src/utils/address'
import { logger } from '@/src/utils/logger'
import type { TokensMap } from '@/src/utils/tokenListsCache'

const BALANCE_EXPIRATION_TIME = 32_000

/** @ignore */
export const lifiConfig = createConfig({
  integrator: env.PUBLIC_APP_NAME,
  providers: [EVM()],
  rpcUrls: lifiRpcUrls,
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
 * On chains not covered by LI.FI (e.g. Sepolia), balance fetching falls back to a
 * direct on-chain multicall. In this mode `priceUSD` is absent from token extensions,
 * so any UI that reads `extensions.priceUSD` should treat `undefined` as "N/A".
 *
 * @param {Object} params - Parameters for tokens fetching
 * @param {Address} [params.account] - Account address for balance fetching (defaults to connected wallet)
 * @param {Chain['id']} [params.chainId] - Specific chain ID to filter tokens (defaults to all supported chains)
 * @param {boolean} [params.withBalance=true] - Whether to fetch token balances
 * @param {boolean} [params.sortByBalance=true] - Whether to sort tokens by balance. When false, source order is preserved even if balances are fetched.
 *
 * @returns {Object} Token data and loading state
 * @returns {Token[]} returns.tokens - Array of tokens with price and balance information
 * @returns {Record<number, Token[]>} returns.tokensByChainId - Tokens organized by chain ID
 * @returns {boolean} returns.isLoadingBalances - Loading state for token balances and prices
 * @returns {boolean} returns.isLoadingPrices - Loading state for token prices only
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
    sortByBalance = true,
  }: {
    account?: Address
    chainId?: Chain['id']
    withBalance?: boolean
    sortByBalance?: boolean
  } = {
    withBalance: true,
    sortByBalance: true,
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
    : Object.keys(tokensData.tokensByChainId).map((id) => Number.parseInt(id, 10))
  const lifiChainsId = chains?.map((chain) => chain.id) ?? []
  const chainsToFetch = dAppChainsId.filter((id) => lifiChainsId.includes(id))

  const { data: tokensPricesByChain, isLoading: isLoadingPrices } = useQuery({
    queryKey: ['lifi', 'tokens', 'prices', chainsToFetch],
    queryFn: () => getTokens({ chains: chainsToFetch }),
    staleTime: BALANCE_EXPIRATION_TIME,
    refetchInterval: BALANCE_EXPIRATION_TIME,
    gcTime: Number.POSITIVE_INFINITY,
    enabled: canFetchBalance && chainsToFetch.length > 0,
  })

  const { data: tokensBalances, isLoading: isLoadingBalances } = useQuery({
    queryKey: ['lifi', 'tokens', 'balances', account, chainsToFetch],
    queryFn: () =>
      getTokenBalances(
        // biome-ignore lint/style/noNonNullAssertion: guarded by enabled: canFetchBalance && !!tokensPricesByChain
        account!,
        // biome-ignore lint/style/noNonNullAssertion: guarded by enabled: canFetchBalance && !!tokensPricesByChain
        Object.entries(tokensPricesByChain!.tokens)
          .filter(([chainId]) => chainsToFetch.includes(Number.parseInt(chainId, 10)))
          .flatMap(([, tokens]) => tokens),
      ),
    staleTime: BALANCE_EXPIRATION_TIME,
    refetchInterval: BALANCE_EXPIRATION_TIME,
    gcTime: Number.POSITIVE_INFINITY,
    enabled: canFetchBalance && !!tokensPricesByChain && chainsToFetch.length > 0,
  })

  // Multicall fallback: used when a specific chain is provided and LI.FI does not
  // cover it (e.g. Sepolia). We wait for the LI.FI chains list to load so we can
  // confirm the chain is absent before triggering on-chain calls.
  const publicClient = usePublicClient({ chainId })
  const useOnchainFallback =
    canFetchBalance && !!chainId && !isLoadingChains && !!chains && !lifiChainsId.includes(chainId)

  const { data: onchainBalances, isLoading: isLoadingOnchainBalances } = useQuery({
    queryKey: ['onchain', 'balances', account, chainId],
    queryFn: async () => {
      // biome-ignore lint/style/noNonNullAssertion: chainId guarded by enabled: useOnchainFallback
      const tokensForChain = tokensData.tokensByChainId[chainId!] ?? []
      const nativeTokens = tokensForChain.filter((t) => isNativeToken(t.address))
      const erc20Tokens = tokensForChain.filter((t) => !isNativeToken(t.address))

      const balances: Record<string, bigint> = {}

      const nativeResults = await Promise.all(
        nativeTokens.map((t) =>
          // biome-ignore lint/style/noNonNullAssertion: publicClient and account guarded by enabled: useOnchainFallback && !!publicClient
          publicClient!.getBalance({ address: account! as Address }).then((b) => ({ t, b })),
        ),
      )
      for (const { t, b } of nativeResults) {
        balances[t.address.toLowerCase()] = b
      }

      if (erc20Tokens.length > 0) {
        // biome-ignore lint/style/noNonNullAssertion: publicClient and account guarded by enabled: useOnchainFallback && !!publicClient
        const results = await publicClient!.multicall({
          contracts: erc20Tokens.map((token) => ({
            address: getAddress(token.address),
            abi: erc20Abi,
            functionName: 'balanceOf' as const,
            // biome-ignore lint/style/noNonNullAssertion: account guarded by enabled: useOnchainFallback
            args: [account! as Address],
          })),
        })
        results.forEach((result, i) => {
          balances[erc20Tokens[i].address.toLowerCase()] =
            result.status === 'success' ? (result.result as bigint) : 0n
        })
      }

      return balances
    },
    staleTime: BALANCE_EXPIRATION_TIME,
    refetchInterval: BALANCE_EXPIRATION_TIME,
    gcTime: Number.POSITIVE_INFINITY,
    enabled: useOnchainFallback && !!publicClient,
  })

  const cache = useMemo(() => {
    if (withBalance && account) {
      if (!isLoadingPrices && !isLoadingBalances && tokensBalances && tokensPricesByChain) {
        return updateTokensBalances(tokensData.tokens, [tokensBalances, tokensPricesByChain], {
          sortByBalance,
        })
      }
      if (useOnchainFallback && !isLoadingOnchainBalances && onchainBalances && chainId) {
        return updateTokensWithRawBalances(
          tokensData.tokens,
          { [chainId]: onchainBalances },
          { sortByBalance },
        )
      }
    }
    return tokensData
  }, [
    account,
    chainId,
    isLoadingBalances,
    isLoadingOnchainBalances,
    isLoadingPrices,
    onchainBalances,
    sortByBalance,
    tokensBalances,
    tokensData,
    tokensPricesByChain,
    useOnchainFallback,
    withBalance,
  ])

  return {
    ...cache,
    isLoadingBalances: Boolean(
      isLoadingChains || isLoadingBalances || isLoadingPrices || isLoadingOnchainBalances,
    ),
    isLoadingPrices: Boolean(isLoadingChains || isLoadingPrices),
  }
}

/**
 * Updates the tokens balances by extending the tokens with balance information and sorting them by balance.
 *
 * @param tokens - The array of tokens.
 * @param results - The results containing the balance tokens and prices.
 * @returns An object containing the updated tokens and tokens grouped by chain ID.
 */
export function updateTokensBalances(
  tokens: Tokens,
  results: [Array<TokenAmount>, TokensResponse],
  { sortByBalance = true }: { sortByBalance?: boolean } = {},
) {
  const [balanceTokens, prices] = results

  logger.time('extending tokens with balance info')
  const priceByChainAddress = Object.entries(prices.tokens).reduce(
    (acc, [chainId, tokens]) => {
      acc[chainId] = {}

      tokens.forEach((token) => {
        acc[chainId][toLocalNativeAddress(token.address)] = token.priceUSD ?? '0'
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

      acc[balanceToken.chainId][toLocalNativeAddress(balanceToken.address)] =
        balanceToken.amount ?? 0n

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

  if (sortByBalance) {
    logger.time('sorting tokens by balance')
    tokensWithBalances.sort(sortFn)
    logger.timeEnd('sorting tokens by balance')
  }

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
  logger.timeEnd('updating tokens cache')

  return { tokens: tokensWithBalances, tokensByChainId: tokensByChain }
}

/**
 * Updates tokens with raw on-chain balances (no price data), sorting tokens with
 * a positive balance before zero-balance tokens. Within each group, source order
 * is preserved. Used as a fallback for chains not covered by LI.FI.
 *
 * @param tokens - The array of tokens to enrich.
 * @param rawBalances - Map of `chainId → address → bigint balance`.
 * @returns Updated tokens and tokens grouped by chain ID.
 */
export function updateTokensWithRawBalances(
  tokens: Tokens,
  rawBalances: Record<number, Record<string, bigint>>,
  { sortByBalance = true }: { sortByBalance?: boolean } = {},
) {
  const tokensWithBalances = tokens.map(
    (token): Token => ({
      ...token,
      extensions: {
        balance: rawBalances[token.chainId]?.[token.address.toLowerCase()] ?? 0n,
      },
    }),
  )

  if (sortByBalance) {
    tokensWithBalances.sort(sortByBalancePresenceFn)
  }

  const tokensByChainId = tokensWithBalances.reduce(
    (acc, token) => {
      if (!acc[token.chainId]) {
        acc[token.chainId] = [token]
      } else {
        acc[token.chainId].push(token)
      }
      return acc
    },
    {} as Record<number, Token[]>,
  )

  return { tokens: tokensWithBalances, tokensByChainId }
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

/**
 * Sorts tokens so those with a positive balance come first, preserving source
 * order within each group. Used when USD price data is unavailable.
 */
function sortByBalancePresenceFn(a: Token, b: Token) {
  const aHas = ((a.extensions?.balance as bigint) ?? 0n) > 0n ? 1 : 0
  const bHas = ((b.extensions?.balance as bigint) ?? 0n) > 0n ? 1 : 0
  return bHas - aHas
}
