import { useDeferredValue, useState } from 'react'

import { type Tokens } from '@/src/token'

export const useTokenSearch = ({
  searchTerm,
  tokens,
}: {
  tokens: Tokens
  searchTerm: string
}): Tokens => {
  const [baseList] = useState(tokens)
  const deferredSearchTerm = useDeferredValue(searchTerm)

  if (!deferredSearchTerm) {
    return baseList
  }

  return baseList.filter((token) => {
    return [token.address, token.symbol, token.name].some((key) =>
      key.toLowerCase().includes(deferredSearchTerm),
    )
  })
}
