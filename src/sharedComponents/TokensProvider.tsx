import {
  type FC,
  type PropsWithChildren,
  createContext,
  useContext,
  Suspense,
  useMemo,
  useDeferredValue,
  useState,
} from 'react'

import {
  type UseSuspenseQueryResult,
  type UseSuspenseQueryOptions,
  useSuspenseQueries,
} from '@tanstack/react-query'
import defaultTokens from '@uniswap/default-token-list'

import { tokenSchema, type Token, type TokenList, type Tokens } from '@/src/token'
import { tokenLists } from '@/src/tokenLists'
import { logger } from '@/src/utils/logger'

export type TokensContextValue = {
  tokens: Tokens
  tokensByChainId: { [chainId: Token['chainId']]: Tokens }
}

const TokensContext = createContext<TokensContextValue | undefined>(undefined)

type PreprocessTokensProps = {
  useDefaultTokens?: boolean
}

/**
 * Generates a unique key identifier for a token
 *
 * @param {Token} token - a Token object
 * @returns {string} chainId-tokenAddress
 */
const tokenKey = (token: Token): string => `${token.chainId}-${token.address.toLowerCase()}`

/**
 * Groups all the tokens fetched from different sources, bundles them in a unique list avoiding duplicates
 * It also arrange the tokens by different criterias (by address, by symbol, and by chainId)
 *
 * @param results - list of TokenList returned by the specified endpoints
 * @returns {TokensContextValue} a map of type { tokens, tokensByAddress, tokensByChainId, tokensBySymbol }
 */
const combineTokenLists = (
  results: Array<UseSuspenseQueryResult<TokenList>>,
): TokensContextValue => {
  logger.time('combining tokens')
  // combines and removes duplicates from the lists of tokens
  const uniqueTokens = Array.from(
    // using Map/Array.from as it's more time-efficient than Object.entries/Object.values approach
    new Map(
      results
        .flatMap((result) => result.data.tokens)
        // ensure that only valid tokens are consumed in runtime
        .filter((token) => {
          const result = tokenSchema.safeParse(token)

          return result.success
        })
        .map((token) => [tokenKey(token), token]),
    ).values(),
  )
  logger.timeEnd('combining tokens')

  logger.time('building tokens maps')
  const tokensMap = uniqueTokens.reduce<TokensContextValue>(
    (acc, token) => {
      acc.tokens.push(token)

      if (!acc.tokensByChainId[token.chainId]) {
        acc.tokensByChainId[token.chainId] = []
      }

      acc.tokensByChainId[token.chainId].push(token)

      return acc
    },
    {
      tokens: [],
      tokensByChainId: {},
    },
  )
  logger.timeEnd('building tokens maps')

  return tokensMap
}

/**
 * A wrapper around fetch, to return the parsed JSON or throw an error if something goes wrong
 *
 * @param url - a link to a list of tokens or 'default' to use the list added as a dependency to the project
 * @returns {Promise<TokenList>} a token list
 */
const fetchUrl = async (url: string): Promise<TokenList> => {
  if (url === 'default') {
    return defaultTokens
  }

  const result = await fetch(url)

  if (!result.ok) {
    throw new Error(
      `Something went wrong. HTTP status code: ${result.status}. Status Message: ${result.statusText}`,
    )
  }

  return result.json()
}

const useLoadTokens = ({ useDefaultTokens = true }: PreprocessTokensProps): TokensContextValue => {
  const tokenListUrls = useMemo(() => {
    const urls = Object.values(tokenLists)
    return useDefaultTokens ? ['default', ...urls] : urls
  }, [useDefaultTokens])

  return useSuspenseQueries({
    queries: tokenListUrls.map<UseSuspenseQueryOptions<TokenList>>((url) => ({
      queryKey: ['tokens-list', url],
      queryFn: () => fetchUrl(url),
      staleTime: Infinity,
    })),
    combine: combineTokenLists,
  })
}

type TokensProviderProps = PreprocessTokensProps

export const BaseTokensProvider: FC<PropsWithChildren<TokensProviderProps>> = ({
  children,
  useDefaultTokens,
}) => {
  const value = useLoadTokens({ useDefaultTokens })

  return <TokensContext.Provider value={value}>{children}</TokensContext.Provider>
}

export const TokensProvider: FC<PropsWithChildren<TokensProviderProps>> = ({
  children,
  useDefaultTokens,
}) => {
  return (
    <Suspense fallback="loading...">
      <BaseTokensProvider useDefaultTokens={useDefaultTokens}>{children}</BaseTokensProvider>
    </Suspense>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTokens = () => {
  const context = useContext(TokensContext)

  if (!context) {
    throw new Error('useTokens must be used within a TokensProvider')
  }

  return context
}

// eslint-disable-next-line react-refresh/only-export-components
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
