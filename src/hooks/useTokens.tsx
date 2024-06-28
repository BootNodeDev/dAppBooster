import { useMemo } from 'react'

import {
  type UseSuspenseQueryOptions,
  useSuspenseQueries,
  type UseSuspenseQueryResult,
} from '@tanstack/react-query'
import defaultTokens from '@uniswap/default-token-list'

import { tokenLists } from '@/src/constants/tokenLists'
import { type Token, type Tokens, tokenSchema, type TokenList } from '@/src/token'
import { logger } from '@/src/utils/logger'

type TokensMap = {
  tokens: Tokens
  tokensByChainId: { [chainId: Token['chainId']]: Tokens }
}

/**
 * Loads the list of tokens provided by config
 *  - Filters out the repeated ones (checks by chain-address pair)
 *  - Discards those that do not complain with tokenSchema
 *
 * @dev intended to be used with `Suspense` wrapper around this hook as it's using `useSuspenseQueries`
 *
 * @param {Object} options
 * @param {boolean} options.useDefaultTokens - if true uses uniswap/default-token-list
 *
 * @returns {TokensMap} list of tokens, tokens grouped by chainId, and symbol->chainId
 */
export const useTokens = ({
  useDefaultTokens = true,
}: {
  useDefaultTokens?: boolean
} = {}): TokensMap => {
  const tokenListUrls = useMemo(() => {
    const urls = Object.values(tokenLists)
    return useDefaultTokens ? ['default', ...urls] : urls
  }, [useDefaultTokens])

  return useSuspenseQueries({
    queries: tokenListUrls.map<UseSuspenseQueryOptions<TokenList>>((url) => ({
      queryKey: ['tokens-list', url],
      queryFn: () => fetchTokenList(url),
      staleTime: Infinity,
    })),
    combine: combineTokenLists,
  })
}

/**
 * Generates a unique key identifier for a token
 *
 * @param {Token} token - a Token object
 * @returns {string} chainId-tokenAddress
 */
function tokenKey(token: Token): string {
  return `${token.chainId}-${token.address.toLowerCase()}`
}

/**
 * Groups all the tokens fetched from different sources, bundles them in a unique list avoiding duplicates
 * It also arrange the tokens by chainId
 *
 * @param results - list of TokenList returned by the specified endpoints
 * @returns {TokensMap} a map of type { tokens, tokensByAddress, tokensByChainId, tokensBySymbol }
 */
function combineTokenLists(results: Array<UseSuspenseQueryResult<TokenList>>): TokensMap {
  logger.time('combining tokens')
  // combines and removes duplicates from the lists of tokens
  const uniqueTokens = Array.from(
    // using Map/Array.from as it's more time-efficient than Object.entries/Object.values approach
    new Map(
      results
        .flatMap((result) => result.data.tokens)
        // ensure that only valid tokens are consumed in runtime
        .filter((token) => {
          const result = tokenSchema.safeParse(token)

          return result.success
        })
        .map((token) => [tokenKey(token), token]),
    ).values(),
  )
  logger.timeEnd('combining tokens')

  logger.time('building tokens maps')
  const tokensMap = uniqueTokens.reduce<TokensMap>(
    (acc, token) => {
      acc.tokens.push(token)

      if (!acc.tokensByChainId[token.chainId]) {
        acc.tokensByChainId[token.chainId] = []
      }

      acc.tokensByChainId[token.chainId].push(token)

      return acc
    },
    {
      tokens: [],
      tokensByChainId: {},
    },
  )
  logger.timeEnd('building tokens maps')

  return tokensMap
}

/**
 * A wrapper around fetch, to return the parsed JSON or throw an error if something goes wrong
 *
 * @param url - a link to a list of tokens or 'default' to use the list added as a dependency to the project
 * @returns {Promise<TokenList>} a token list
 */
export async function fetchTokenList(url: string): Promise<TokenList> {
  if (url === 'default') {
    return defaultTokens
  }

  const result = await fetch(url)

  if (!result.ok) {
    throw new Error(
      `Something went wrong. HTTP status code: ${result.status}. Status Message: ${result.statusText}`,
    )
  }

  return result.json()
}
