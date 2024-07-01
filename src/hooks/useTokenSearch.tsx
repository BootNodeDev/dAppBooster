import { Dispatch, SetStateAction, useDeferredValue, useState } from 'react'

import { type Tokens } from '@/src/types/token'

type TokenSearch = {
  searchResult: Tokens
  searchTerm: string
  setSearchTerm: Dispatch<SetStateAction<string>>
}

/**
 * A hook that provides a performant search to filter a list of tokens by a searchTerm
 * Internally it uses React's `useDeferredValue`
 *
 * @param {Array} tokens - a list of tokens to be filtered by `searchTerm`
 * @returns {Array} List of Tokens
 */
export const useTokenSearch = (tokens: Tokens): TokenSearch => {
  const [searchTerm, setSearchTerm] = useState('')
  const [baseList] = useState(tokens)
  const deferredSearchTerm = useDeferredValue(searchTerm)

  // if no searchTerm, return the unfiltered list
  if (!deferredSearchTerm) {
    return { searchResult: baseList, searchTerm, setSearchTerm }
  }

  const searchResult = baseList.filter((token) => {
    return [token.address, token.symbol, token.name].some((key) =>
      key.toLowerCase().includes(deferredSearchTerm.toLowerCase()),
    )
  })

  return { searchResult, searchTerm, setSearchTerm }
}
