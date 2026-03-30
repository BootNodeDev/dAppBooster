import type { Token } from '@/src/types/token'
import tokenListsCache, { updateTokenListsCache } from '@/src/utils/tokenListsCache'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { createElement } from 'react'
import type { ReactNode } from 'react'
import { zeroAddress } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/src/utils/tokenListsCache', () => {
  const cache = { tokens: [] as Token[], tokensByChainId: {} as Record<number, Token[]> }
  return {
    default: cache,
    updateTokenListsCache: vi.fn((map: typeof cache) => {
      cache.tokens = map.tokens
      cache.tokensByChainId = map.tokensByChainId
    }),
    addTokenToTokenList: vi.fn(),
  }
})

vi.mock('@/src/env', () => ({
  env: {
    PUBLIC_NATIVE_TOKEN_ADDRESS: zeroAddress.toLowerCase(),
    PUBLIC_USE_DEFAULT_TOKENS: false,
  },
}))

vi.mock('@/src/constants/tokenLists', () => ({
  tokenLists: {},
}))

vi.mock('@tanstack/react-query', async (importActual) => {
  const actual = await importActual<typeof import('@tanstack/react-query')>()
  return { ...actual, useSuspenseQueries: vi.fn() }
})

import * as tanstackQuery from '@tanstack/react-query'
import { useTokenLists } from './useTokenLists'

const mockToken1: Token = {
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  chainId: 1,
  decimals: 6,
  name: 'USD Coin',
  symbol: 'USDC',
}
const mockToken2: Token = {
  address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  chainId: 1,
  decimals: 6,
  name: 'Tether USD',
  symbol: 'USDT',
}

const mockSuspenseQueryResult = (tokens: Token[]) => ({
  data: { name: 'Mock List', timestamp: '', version: { major: 1, minor: 0, patch: 0 }, tokens },
  isLoading: false,
  isSuccess: true,
  error: null,
})

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(QueryClientProvider, { client: new QueryClient() }, children)

beforeEach(() => {
  // Reset cache between tests
  tokenListsCache.tokens = []
  tokenListsCache.tokensByChainId = {}
  vi.mocked(updateTokenListsCache).mockImplementation((map) => {
    tokenListsCache.tokens = map.tokens
    tokenListsCache.tokensByChainId = map.tokensByChainId
  })
})

describe('useTokenLists', () => {
  it('returns tokens and tokensByChainId', () => {
    vi.mocked(tanstackQuery.useSuspenseQueries).mockReturnValueOnce(
      // biome-ignore lint/suspicious/noExplicitAny: mocking overloaded hook return type
      { tokens: [mockToken1], tokensByChainId: { 1: [mockToken1] } } as any,
    )

    const { result } = renderHook(() => useTokenLists(), { wrapper })
    expect(result.current.tokens).toBeDefined()
    expect(result.current.tokensByChainId).toBeDefined()
  })

  it('deduplicates tokens with the same chainId and address', () => {
    // biome-ignore lint/suspicious/noExplicitAny: mocking internal combine param
    vi.mocked(tanstackQuery.useSuspenseQueries).mockImplementation(({ combine }: any) => {
      const results = [
        mockSuspenseQueryResult([mockToken1, mockToken2]),
        mockSuspenseQueryResult([{ ...mockToken1 }]), // duplicate
      ]
      return combine(results)
    })

    const { result } = renderHook(() => useTokenLists(), { wrapper })
    const erc20Tokens = result.current.tokens.filter((t) => t.address !== zeroAddress.toLowerCase())
    expect(erc20Tokens).toHaveLength(2)
    expect(erc20Tokens.map((t) => t.symbol)).toContain('USDC')
    expect(erc20Tokens.map((t) => t.symbol)).toContain('USDT')
  })

  it('injects a native ETH token for mainnet (chainId 1) tokens', () => {
    vi.mocked(tanstackQuery.useSuspenseQueries).mockImplementation(
      // biome-ignore lint/suspicious/noExplicitAny: mocking internal combine param
      ({ combine }: any) => combine([mockSuspenseQueryResult([mockToken1])]),
    )

    const { result } = renderHook(() => useTokenLists(), { wrapper })
    const nativeToken = result.current.tokensByChainId[1]?.[0]
    expect(nativeToken?.address).toBe(zeroAddress.toLowerCase())
    expect(nativeToken?.symbol).toBe('ETH')
  })

  it('filters out tokens that fail schema validation', () => {
    // biome-ignore lint/suspicious/noExplicitAny: mocking internal combine param
    vi.mocked(tanstackQuery.useSuspenseQueries).mockImplementation(({ combine }: any) => {
      const invalidToken = {
        address: 'not-an-address',
        chainId: 1,
        name: 'Bad',
        symbol: 'BAD',
        decimals: 18,
      }
      // biome-ignore lint/suspicious/noExplicitAny: intentionally testing invalid token input
      return combine([mockSuspenseQueryResult([mockToken1, invalidToken as any])])
    })

    const { result } = renderHook(() => useTokenLists(), { wrapper })
    const erc20Tokens = result.current.tokens.filter((t) => t.address !== zeroAddress.toLowerCase())
    expect(erc20Tokens).toHaveLength(1)
    expect(erc20Tokens[0].symbol).toBe('USDC')
  })
})
