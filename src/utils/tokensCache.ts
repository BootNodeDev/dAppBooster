import { env } from '@/src/env'
import type { Token, Tokens } from '@/src/types/token'

export type TokensMap = {
  tokens: Tokens
  tokensByChainId: { [chainId: Token['chainId']]: Tokens }
}

export type TokensCache = {
  withDefaultTokens: TokensMap
  withoutDefaultTokens: TokensMap
}

const tokensCache: TokensCache = {
  withDefaultTokens: {
    tokens: [],
    tokensByChainId: {},
  },
  withoutDefaultTokens: {
    tokens: [],
    tokensByChainId: {},
  },
}

export const updateTokensCache = (
  tokensMap: TokensMap,
  withDefaultTokens = env.PUBLIC_USE_DEFAULT_TOKENS,
) => {
  tokensCache[withDefaultTokens ? 'withDefaultTokens' : 'withoutDefaultTokens'] = tokensMap
}

export default tokensCache
