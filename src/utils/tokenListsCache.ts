import type { Token, Tokens } from '@/src/types/token'

/**
 * Represents a cache for the list of tokens that is loaded at app startup.
 * This file serves as a minimum version of the cache, potentially acting as a singleton.
 */
export type TokensMap = {
  tokens: Tokens
  tokensByChainId: { [chainId: Token['chainId']]: Tokens }
}

const tokenListsCache: TokensMap = {
  tokens: [],
  tokensByChainId: {},
}

/**
 * Updates the token lists cache with the provided tokens map.
 * @param tokensMap - The tokens map to update the cache with.
 */
export const updateTokenListsCache = (tokensMap: TokensMap) => {
  tokenListsCache.tokens = tokensMap.tokens
  tokenListsCache.tokensByChainId = tokensMap.tokensByChainId
}

/**
 * Updates the token lists cache with the provided token.
 * @param token - The token to add to the cache.
 */
export const addTokenToTokenList = (token: Token) => {
  // add token to the main list if it's not already there
  if (
    !tokenListsCache.tokens.some(
      (t) => t.address.toLowerCase() === token.address.toLowerCase() && t.chainId === token.chainId,
    )
  ) {
    tokenListsCache.tokens.push(token)
  }

  // add token to the chain list if it's not already there
  if (
    tokenListsCache.tokensByChainId[token.chainId]?.some(
      (t) => t.address.toLowerCase() === token.address.toLowerCase(),
    )
  ) {
    return
  }

  if (!tokenListsCache.tokensByChainId[token.chainId]) {
    tokenListsCache.tokensByChainId[token.chainId] = []
  }
  tokenListsCache.tokensByChainId[token.chainId].push(token)
}

export default tokenListsCache
