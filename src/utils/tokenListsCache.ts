import type { Token, Tokens } from '@/src/types/token'

export type TokensMap = {
  tokens: Tokens
  tokensByChainId: { [chainId: Token['chainId']]: Tokens }
}

const tokenListsCache: TokensMap = {
  tokens: [],
  tokensByChainId: {},
}

export const updateTokenListsCache = (tokensMap: TokensMap) => {
  tokenListsCache.tokens = tokensMap.tokens
  tokenListsCache.tokensByChainId = tokensMap.tokensByChainId
}

export default tokenListsCache
