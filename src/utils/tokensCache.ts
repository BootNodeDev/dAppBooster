import type { Token, Tokens } from '@/src/types/token'

export type TokensMap = {
  tokens: Tokens
  tokensByChainId: { [chainId: Token['chainId']]: Tokens }
}

const tokensCache: TokensMap = {
  tokens: [],
  tokensByChainId: {},
}

export const updateTokensCache = (tokensMap: TokensMap) => {
  tokensCache.tokens = tokensMap.tokens
  tokensCache.tokensByChainId = tokensMap.tokensByChainId
}

export default tokensCache
