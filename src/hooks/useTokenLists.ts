import { useMemo } from 'react'

import {
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
  useSuspenseQueries,
} from '@tanstack/react-query'
import defaultTokens from '@uniswap/default-token-list'
import * as chains from 'viem/chains'

import { tokenLists } from '@/src/constants/tokenLists'
import { env } from '@/src/env'
import { type Token, type TokenList, tokenSchema } from '@/src/types/token'
import { logger } from '@/src/utils/logger'
import tokenListsCache, { updateTokenListsCache, type TokensMap } from '@/src/utils/tokenListsCache'

/**
 * Loads and processes token lists from configured sources
 *
 * Fetches tokens from multiple token list URLs defined in configuration,
 * processes them to create a unified token list with these features:
 * - Filters duplicate tokens (based on chain-address pair)
 * - Validates tokens against schema requirements
 * - Automatically adds native tokens for each chain
 * - Organizes tokens by chainId for efficient lookup
 * - Utilizes caching for performance optimization
 *
 * @dev Intended to be used with a `Suspense` wrapper as it uses `useSuspenseQueries`
 * @dev Uses infinite cache durations as token lists rarely change
 *
 * @returns {TokensMap} Object containing:
 * @returns {Token[]} returns.tokens - Flat array of all unique tokens
 * @returns {Record<number, Token[]>} returns.tokensByChainId - Tokens grouped by chain ID
 *
 * @example
 * ```tsx
 * const TokenListComponent = () => {
 *   const { tokens, tokensByChainId } = useTokenLists();
 *
 *   return (
 *     <div>
 *       <p>Total tokens: {tokens.length}</p>
 *       <p>Ethereum tokens: {tokensByChainId[1]?.length || 0}</p>
 *     </div>
 *   );
 * };
 *
 * // With Suspense wrapper
 * const App = () => (
 *   <Suspense fallback={<div>Loading token lists...</div>}>
 *     <TokenListComponent />
 *   </Suspense>
 * );
 * ```
 */
export const useTokenLists = (): TokensMap => {
  const tokenListUrls = useMemo(() => {
    const urls = Object.values(tokenLists)
    return env.PUBLIC_USE_DEFAULT_TOKENS ? ['default', ...urls] : urls
  }, [])

  return useSuspenseQueries({
    queries: tokenListUrls.map<UseSuspenseQueryOptions<TokenList>>((url) => ({
      queryKey: ['tokens-list', url],
      queryFn: () => fetchTokenList(url),
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
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
  if (tokenListsCache.tokens.length) {
    return tokenListsCache
  }

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
      if (!acc.tokensByChainId[token.chainId]) {
        try {
          // if there's a native token for the chain
          const nativeToken = buildNativeToken(token.chainId)

          // add it to the list
          acc.tokensByChainId[token.chainId] = [nativeToken]
          acc.tokens.push(nativeToken)
        } catch (err) {
          console.error(err)
          // if there's no native token for the chain, ignore the error
          acc.tokensByChainId[token.chainId] = []
        }
      }

      acc.tokens.push(token)
      acc.tokensByChainId[token.chainId].push(token)

      return acc
    },
    {
      tokens: [],
      tokensByChainId: {},
    },
  )
  logger.timeEnd('building tokens maps')

  updateTokenListsCache(tokensMap)

  return tokensMap
}

/**
 * A wrapper around fetch, to return the parsed JSON or throw an error if something goes wrong
 *
 * @param url - a link to a list of tokens or 'default' to use the list added as a dependency to the project
 * @returns {Promise<TokenList>} a token list
 */
async function fetchTokenList(url: string): Promise<TokenList> {
  if (url === 'default') {
    return defaultTokens as TokenList
  }

  const result = await fetch(url)

  if (!result.ok) {
    throw new Error(
      `Something went wrong. HTTP status code: ${result.status}. Status Message: ${result.statusText}`,
    )
  }

  return result.json()
}

/**
 * Builds a native token object based on the chain ID.
 *
 * @param chainId - The ID of the chain.
 * @returns The native token object.
 */
function buildNativeToken(chainId: Token['chainId']): Token {
  const tokenInfo = Object.values(chains).find((chain) => chain.id === chainId)?.nativeCurrency

  if (!tokenInfo) {
    throw new Error(`Native token not found for chain ID: ${chainId}`)
  }

  return {
    name: tokenInfo.name,
    address: env.PUBLIC_NATIVE_TOKEN_ADDRESS,
    chainId: chainId,
    decimals: tokenInfo.decimals,
    symbol: tokenInfo.symbol,
  }
}
