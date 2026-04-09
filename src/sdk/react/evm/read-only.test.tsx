import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { DAppBoosterProvider } from '../provider/DAppBoosterProvider'
import { useEvmReadOnly } from './read-only'

vi.mock('@/src/wallet/providers', () => ({
  Web3Provider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem')>()
  return {
    ...actual,
    createPublicClient: vi.fn(() => ({
      type: 'mock-public-client',
      readContract: vi.fn(),
    })),
  }
})

const mockChain = {
  caip2Id: 'eip155:1',
  chainId: 1,
  name: 'Ethereum',
  chainType: 'evm',
  nativeCurrency: { symbol: 'ETH', decimals: 18 },
  addressConfig: { format: 'hex' as const, patterns: [], example: '0x...' },
  endpoints: [{ url: 'https://eth.example.com', protocol: 'json-rpc' as const }],
}

const makeWrapper =
  () =>
  ({ children }: { children: ReactNode }) =>
    createElement(DAppBoosterProvider, { config: { chains: [mockChain] } }, children)

describe('useEvmReadOnly', () => {
  it('returns a PublicClient-typed client for an EVM chain', () => {
    const { result } = renderHook(() => useEvmReadOnly({ chainId: 1 }), {
      wrapper: makeWrapper(),
    })
    expect(result.current.client).not.toBeNull()
    expect(result.current.client).toHaveProperty('readContract')
  })

  it('returns the chain descriptor', () => {
    const { result } = renderHook(() => useEvmReadOnly({ chainId: 1 }), {
      wrapper: makeWrapper(),
    })
    expect(result.current.chain?.name).toBe('Ethereum')
  })

  it('works without provider readClientFactories configured', () => {
    const { result } = renderHook(() => useEvmReadOnly({ chainId: 1 }), {
      wrapper: makeWrapper(),
    })
    expect(result.current.client).not.toBeNull()
  })

  it('returns null client for unknown chainId', () => {
    const { result } = renderHook(() => useEvmReadOnly({ chainId: 999 }), {
      wrapper: makeWrapper(),
    })
    expect(result.current.chain).toBeNull()
    expect(result.current.client).toBeNull()
  })
})
