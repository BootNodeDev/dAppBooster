import { createContext, type FC, type PropsWithChildren } from 'react'

import { type TokensMap, useLoadTokens } from '@/src/hooks/useLoadTokens'

export const TokensContext = createContext<TokensMap | undefined>(undefined)

const TokensProvider: FC<PropsWithChildren> = ({ children }) => {
  const tokens = useLoadTokens()

  return <TokensContext.Provider value={tokens}>{children}</TokensContext.Provider>
}

export default TokensProvider
