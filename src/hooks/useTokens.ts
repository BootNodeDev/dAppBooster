import { useMemo } from 'react'

import {
  createConfig,
  EVM,
  getTokenBalances,
  getTokens,
  type Token as LiFiToken,
  type TokenAmount,
  type TokensResponse,
} from '@lifi/sdk'
import { useQuery } from '@tanstack/react-query'
import { type Address, formatUnits } from 'viem'

import { env } from '@/src/env'
import { useTokenLists } from '@/src/hooks/useTokenLists'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { type Token, type Tokens } from '@/src/types/token'
import { logger } from '@/src/utils/logger'
import { type TokensMap } from '@/src/utils/tokenListsCache'

const BALANCE_EXPIRATION_TIME = 32_000

/** @ignore */
export const lifiConfig = createConfig({
  integrator: env.PUBLIC_APP_NAME,
  providers: [EVM()],
})

/**
 * Custom hook for fetching and managing tokens data. It fetches tokens data and optionally token balances.
 *
 * @param {Object} params - Params for fetching tokens data.
 * @param {Address} params.account - The account address for which to fetch token balances. If not specified,
 *  the connected account will be used.
 * @param {boolean} params.withBalance - Whether to fetch token balances or not. Defaults to true.
 *
 * @returns An object containing tokens data and loading state.
 */
export const useTokens = (
  { account, withBalance }: { account?: Address; withBalance?: boolean } = { withBalance: true },
) => {
  const { address } = useWeb3Status()
  const tokensData = useTokenLists()
  account ??= address

  const canFetchBalance = !!account && withBalance

  const { data: tokensPricesByChain, isLoading: ilp } = useQuery({
    queryKey: ['lifi', 'tokens', 'prices'],
    queryFn: () =>
      // we can use this to narrow the query to the chains we have tokens for
      // but we must ensure that the chains are supported by lifi's API
      // getTokens({ chains: Object.keys(tokensByChainId).map((id) => parseInt(id)) }),
      getTokens(),
    staleTime: BALANCE_EXPIRATION_TIME,
    refetchInterval: BALANCE_EXPIRATION_TIME,
    gcTime: Infinity,
    enabled: canFetchBalance,
  })

  const { data: tokensBalances, isLoading: ilb } = useQuery({
    queryKey: ['lifi', 'tokens', 'balances', account],
    queryFn: () =>
      getTokenBalances(
        account!,
        Object.values(tokensPricesByChain!.tokens).flat() as Array<LiFiToken>,
      ),
    staleTime: BALANCE_EXPIRATION_TIME,
    refetchInterval: BALANCE_EXPIRATION_TIME,
    gcTime: Infinity,
    enabled: canFetchBalance && !!tokensPricesByChain,
  })

  const cache = useMemo(() => {
    if (withBalance && account && !ilp && !ilb && tokensBalances && tokensPricesByChain) {
      return udpateTokensBalances(tokensData.tokens, [tokensBalances, tokensPricesByChain])
    }
    return tokensData
  }, [account, ilb, ilp, tokensBalances, tokensData, tokensPricesByChain, withBalance])

  return { ...cache, isLoadingBalances: Boolean(ilb || ilp) }
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
    parseFloat(formatUnits((b.extensions?.balance as bigint) ?? 0n, b.decimals)) *
      parseFloat((b.extensions?.priceUSD as string) ?? '0') -
    parseFloat(formatUnits((a.extensions?.balance as bigint) ?? 0n, a.decimals)) *
      parseFloat((a.extensions?.priceUSD as string) ?? '0')
  )
}
