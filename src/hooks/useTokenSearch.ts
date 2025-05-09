import {
  type DependencyList,
  type Dispatch,
  type SetStateAction,
  useDeferredValue,
  useEffect,
  useState,
} from 'react'

import type { Tokens } from '@/src/types/token'

type TokenSearchOptions = {
  defaultSearchTerm?: string
  tokens: Tokens
}

type TokenSearch = {
  searchResult: Tokens
  searchTerm: string
  setSearchTerm: Dispatch<SetStateAction<string>>
}

/**
 * Custom hook that provides performant token search functionality.
 *
 * Enables efficient filtering of token lists by searching through token properties,
 * using React's `useDeferredValue` to prevent UI blocking during search operations.
 * The hook searches for matches in token address, symbol, and name properties.
 *
 * @param {Object} options - Token search configuration
 * @param {string} [options.defaultSearchTerm] - Initial search term to filter tokens
 * @param {Tokens} options.tokens - Array of token objects to search through
 * @param {DependencyList} [deps=[]] - Additional dependencies that trigger search recalculation
 *
 * @returns {Object} Search state and controls
 * @returns {Tokens} returns.searchResult - Filtered tokens matching the search term
 * @returns {string} returns.searchTerm - Current search term
 * @returns {Dispatch<SetStateAction<string>>} returns.setSearchTerm - Function to update search term
 *
 * @example
 * ```tsx
 * const { tokens } = useTokens();
 * const { searchResult, searchTerm, setSearchTerm } = useTokenSearch({
 *   tokens,
 *   defaultSearchTerm: 'eth'
 * });
 *
 * return (
 *   <>
 *     <input
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *       placeholder="Search tokens..."
 *     />
 *     <TokenList tokens={searchResult} />
 *   </>
 * );
 * ```
 */
export const useTokenSearch = (
  { defaultSearchTerm, tokens }: TokenSearchOptions,
  deps: DependencyList = [],
): TokenSearch => {
  const [searchTerm, setSearchTerm] = useState(defaultSearchTerm ?? '')
  const [baseList, setBaseList] = useState(tokens)
  const deferredSearchTerm = useDeferredValue(searchTerm)

  // update the baseList when deps changes
  useEffect(() => {
    setBaseList(tokens)
  }, [tokens, ...deps])

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
