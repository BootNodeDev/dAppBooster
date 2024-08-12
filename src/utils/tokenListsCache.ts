import { type Token, type Tokens } from '@/src/types/token'

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
  // if already exists, do not add
  if (
    tokenListsCache.tokens.some(
      (t) => t.address.toLowerCase() === token.address.toLowerCase() && t.chainId === token.chainId,
    )
  ) {
    return
  }

  tokenListsCache.tokens.push(token)
  if (!tokenListsCache.tokensByChainId[token.chainId]) {
    tokenListsCache.tokensByChainId[token.chainId] = []
  }
  tokenListsCache.tokensByChainId[token.chainId].push(token)
}

export default tokenListsCache
