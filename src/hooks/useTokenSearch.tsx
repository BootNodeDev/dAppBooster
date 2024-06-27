import { useDeferredValue, useState } from 'react'

import { type Tokens } from '@/src/token'

type TokenSearch = {
  searchTerm: string
  tokens: Tokens
}

/**
 * A hook that provides a performant search to filter a list of tokens by a searchTerm
 * Internally it uses React's `useDeferredValue`
 *
 * @param {Object} options
 * @param {string} options.searchTerm - the string used to filter the list of `tokens`
 * @param {Array} options.tokens - a list of tokens to be filtered by `searchTerm`
 * @returns {Array} List of Tokens
 */
export const useTokenSearch = ({ searchTerm, tokens }: TokenSearch): Tokens => {
  const [baseList] = useState(tokens)
  const deferredSearchTerm = useDeferredValue(searchTerm)

  // if no searchTerm, return the unfiltered list
  if (!deferredSearchTerm) {
    return baseList
  }

  return baseList.filter((token) => {
    return [token.address, token.symbol, token.name].some((key) =>
      key.toLowerCase().includes(deferredSearchTerm.toLowerCase()),
    )
  })
}
