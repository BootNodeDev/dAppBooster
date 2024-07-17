import type { TokenAmount, TokensResponse } from '@lifi/sdk'
import { formatUnits } from 'viem'

import { Tokens } from '@/src/types/token'
import { logger } from '@/src/utils/logger'

export const CACHE_EXPIRATION_TIME = 30_000

export type TokenWithAmount = Omit<TokenAmount, 'amount' | 'chainId'> & {
  amount: bigint
  chainId: number
}

export type TokensBalances = {
  [wallet: string]: {
    timestamp: number
    data: {
      [chainId: number]: Array<TokenWithAmount>
    }
  }
}

const tokensBalancesCache: TokensBalances = {}

export function updateTokenBalanceCache(
  account: string,
  tokens: Tokens,
  results: [TokenAmount[], TokensResponse],
): TokensBalances {
  const [balanceTokens, prices] = results

  // Cache control
  if (tokensBalancesCache[account]) {
    const cacheExpired =
      // defaults to Infinity if not set, so it's considered expired
      (tokensBalancesCache[account].timestamp ?? Infinity) < Date.now() - CACHE_EXPIRATION_TIME

    if (tokensBalancesCache[account]?.timestamp !== undefined) {
      // if set and expired, update the timestamp
      if (cacheExpired) {
        tokensBalancesCache[account].timestamp = Date.now()
      } else {
        // if not expired, return the cache
        return tokensBalancesCache
      }
    }
  }

  // initialize cache for the wallet if not set
  if (!tokensBalancesCache[account]) {
    tokensBalancesCache[account] = {
      timestamp: Date.now(),
      data: {},
    }
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

  const tokensWithBalances = tokens.map((token): TokenWithAmount => {
    // initialize cache for the chain if not set
    if (!tokensBalancesCache[account].data[token.chainId]) {
      tokensBalancesCache[account].data[token.chainId] = []
    }

    const tokenPrice = priceByChainAddress[token.chainId]?.[token.address] ?? '0'

    const tokenBalance = balanceTokensByChain[token.chainId]?.[token.address] ?? 0n

    return {
      ...token,
      priceUSD: tokenPrice,
      amount: tokenBalance,
    }
  })
  logger.timeEnd('extending tokens with balance info')

  logger.time('sorting tokens by balance')
  tokensWithBalances.sort(sortFn)
  logger.timeEnd('sorting tokens by balance')

  logger.time('updating tokens cache')
  const tokensByChain = tokensWithBalances.reduce(
    (acc, token) => {
      if (acc[token.chainId]) {
        acc[token.chainId].push(token)
      } else {
        acc[token.chainId] = [token]
      }

      return acc
    },
    {} as TokensBalances[string]['data'],
  )

  tokensBalancesCache[account].data = tokensByChain
  logger.timeEnd('updating tokens cache')

  return tokensBalancesCache
}

export default tokensBalancesCache

function sortFn(a: TokenAmount, b: TokenAmount) {
  return (
    parseFloat(formatUnits(b.amount ?? 0n, b.decimals)) * parseFloat(b.priceUSD ?? '0') -
    parseFloat(formatUnits(a.amount ?? 0n, a.decimals)) * parseFloat(a.priceUSD ?? '0')
  )
}
