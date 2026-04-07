import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { zeroAddress } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type Token, tokenSchema } from '@/src/types/token'
import tokenListsCache, { updateTokenListsCache } from '@/src/utils/tokenListsCache'

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
import { fetchTokenList, useTokenLists } from './useTokenLists'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

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

describe('fetchTokenList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty token list on HTTP error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 504,
      statusText: 'Gateway Timeout',
    })

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = await fetchTokenList('https://example.com/tokens.json')

    expect(result.tokens).toEqual([])
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Token list fetch failed'))
    warnSpy.mockRestore()
  })

  it('returns empty token list on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = await fetchTokenList('https://example.com/tokens.json')

    expect(result.tokens).toEqual([])
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Token list fetch failed'),
      'Network error',
    )
    warnSpy.mockRestore()
  })

  it('returns empty token list on invalid JSON schema', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ error: 'not a token list' }),
    })

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = await fetchTokenList('https://example.com/tokens.json')

    expect(result.tokens).toEqual([])
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('invalid schema'))
    warnSpy.mockRestore()
  })

  it('returns token list on valid response', async () => {
    const validTokenList = {
      name: 'Test',
      timestamp: '2026-01-01',
      version: { major: 1, minor: 0, patch: 0 },
      tokens: [{ symbol: 'ETH', name: 'Ether', address: '0x0', chainId: 1, decimals: 18 }],
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validTokenList),
    })

    const result = await fetchTokenList('https://example.com/tokens.json')

    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0].symbol).toBe('ETH')
  })

  it('returns empty token list when tokens field is not an array', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ tokens: 'not an array' }),
    })

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = await fetchTokenList('https://example.com/tokens.json')

    expect(result.tokens).toEqual([])
    warnSpy.mockRestore()
  })

  describe("'default' bundled token list", () => {
    it('returns a non-empty tokens array', async () => {
      const result = await fetchTokenList('default')

      expect(Array.isArray(result.tokens)).toBe(true)
      expect(result.tokens.length).toBeGreaterThan(0)
    })

    it('every EVM token conforms to tokenSchema', async () => {
      const result = await fetchTokenList('default')

      // The bundled list includes non-EVM tokens (e.g. Solana with base58 addresses)
      // alongside EVM tokens. Non-EVM entries are filtered out downstream by useTokenLists
      // via safeParse. Here we validate only the EVM-addressable subset.
      const evmTokens = result.tokens.filter(({ address }) => /^0x[a-fA-F0-9]{40}$/.test(address))
      expect(evmTokens.length).toBeGreaterThan(0)
      for (const token of evmTokens) {
        expect(() => tokenSchema.parse(token)).not.toThrow()
      }
    })
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
