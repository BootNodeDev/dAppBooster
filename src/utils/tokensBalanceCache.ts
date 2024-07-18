import type { TokenAmount, TokensResponse } from '@lifi/sdk'
import { formatUnits } from 'viem'

import { Token, Tokens } from '@/src/types/token'
import { logger } from '@/src/utils/logger'
import { TokensMap } from '@/src/utils/tokensCache'

export const BALANCE_CACHE_EXPIRATION_TIME = 32_000

export type TokensBalances = TokensMap & {
  account: string
  timestamp: number
}

const initialTokenBalanceCache: TokensBalances = {
  account: '',
  timestamp: 0,
  tokens: [],
  tokensByChainId: {},
}

const tokensBalancesCache: TokensBalances = { ...initialTokenBalanceCache }

export function updateTokenBalanceCache(
  account: string,
  tokens: Tokens,
  results: [Array<TokenAmount>, TokensResponse],
): TokensBalances {
  const [balanceTokens, prices] = results

  // Cache control
  if (tokensBalancesCache.account === account) {
    const cacheExpired =
      // defaults to Infinity if not set, so it's considered expired
      (tokensBalancesCache.timestamp ?? Infinity) < Date.now() - BALANCE_CACHE_EXPIRATION_TIME

    if (tokensBalancesCache?.timestamp !== undefined) {
      // if set and expired, update the timestamp
      if (cacheExpired) {
        tokensBalancesCache.timestamp = Date.now()
      } else {
        // if not expired, return the cache
        return tokensBalancesCache
      }
    }
  }

  // initialize cache for the wallet if not set
  if (tokensBalancesCache.account !== account) {
    tokensBalancesCache.account = account
    tokensBalancesCache.timestamp = Date.now()
    tokensBalancesCache.tokens = initialTokenBalanceCache.tokens
    tokensBalancesCache.tokensByChainId = initialTokenBalanceCache.tokensByChainId
  }

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
    // initialize cache for the chain if not set
    if (!tokensBalancesCache.tokensByChainId[token.chainId]) {
      tokensBalancesCache.tokensByChainId[token.chainId] = []
    }

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
    {} as TokensBalances['tokensByChainId'],
  )

  tokensBalancesCache.tokens = tokensWithBalances
  tokensBalancesCache.tokensByChainId = tokensByChain
  logger.timeEnd('updating tokens cache')

  return tokensBalancesCache
}

export default tokensBalancesCache

function sortFn(a: Token, b: Token) {
  return (
    parseFloat(formatUnits((b.extensions?.balance as bigint) ?? 0n, b.decimals)) *
      parseFloat((b.extensions?.priceUSD as string) ?? '0') -
    parseFloat(formatUnits((a.extensions?.balance as bigint) ?? 0n, a.decimals)) *
      parseFloat((a.extensions?.priceUSD as string) ?? '0')
  )
}
