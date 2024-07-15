import { useContext } from 'react'

import { TokensContext } from '@/src/providers/TokensProvider'

export const useTokens = () => {
  const context = useContext(TokensContext)

  if (context === undefined) {
    throw new Error('useTokens must be used within a TokensProvider')
  }

  return context
}
