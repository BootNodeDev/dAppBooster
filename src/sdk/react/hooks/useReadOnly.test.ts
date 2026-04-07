import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { ReadClientFactory } from '../../core/adapters/provider'
import { DAppBoosterProvider } from '../provider/DAppBoosterProvider'
import { useReadOnly } from './useReadOnly'

vi.mock('@/src/wallet/providers', () => ({
  Web3Provider: ({ children }: { children: ReactNode }) => children,
}))

const mockChain = {
  caip2Id: 'eip155:1',
  chainId: 1,
  name: 'Ethereum',
  chainType: 'evm',
  nativeCurrency: { symbol: 'ETH', decimals: 18 },
  addressConfig: { format: 'hex' as const, patterns: [], example: '0x...' },
}

const mockChainWithEndpoint = {
  ...mockChain,
  endpoints: [{ url: 'https://rpc.example.com', protocol: 'json-rpc' as const }],
}

const makeWrapper =
  (config: Parameters<typeof DAppBoosterProvider>[0]['config']) =>
  ({ children }: { children: ReactNode }) =>
    createElement(DAppBoosterProvider, { config }, children)

describe('useReadOnly', () => {
  it('returns null chain when chainId not in registry', () => {
    const wrapper = makeWrapper({ chains: [] })
    const { result } = renderHook(() => useReadOnly({ chainId: 999 }), { wrapper })
    expect(result.current.chain).toBeNull()
    expect(result.current.client).toBeNull()
  })

  it('returns chain descriptor when chainId found', () => {
    const wrapper = makeWrapper({ chains: [mockChain] })
    const { result } = renderHook(() => useReadOnly({ chainId: 1 }), { wrapper })
    expect(result.current.chain).not.toBeNull()
    expect(result.current.chain?.name).toBe('Ethereum')
  })

  it('client is null when no factory registered', () => {
    const wrapper = makeWrapper({ chains: [mockChainWithEndpoint] })
    const { result } = renderHook(() => useReadOnly({ chainId: 1 }), { wrapper })
    expect(result.current.chain).not.toBeNull()
    expect(result.current.client).toBeNull()
  })

  it('client is null when chain has no endpoints', () => {
    const mockFactory: ReadClientFactory = {
      chainType: 'evm',
      createClient: vi.fn(),
    }
    const wrapper = makeWrapper({
      chains: [mockChain],
      readClientFactories: [mockFactory],
    })
    const { result } = renderHook(() => useReadOnly({ chainId: 1 }), { wrapper })
    expect(result.current.chain).not.toBeNull()
    expect(result.current.client).toBeNull()
    expect(mockFactory.createClient).not.toHaveBeenCalled()
  })

  it('client is created from factory when factory and endpoint exist', () => {
    const mockFactory: ReadClientFactory = {
      chainType: 'evm',
      createClient: vi.fn((endpoint, chainId) => ({ endpoint, chainId })),
    }
    const wrapper = makeWrapper({
      chains: [mockChainWithEndpoint],
      readClientFactories: [mockFactory],
    })
    const { result } = renderHook(() => useReadOnly({ chainId: 1 }), { wrapper })
    expect(result.current.chain).not.toBeNull()
    expect(result.current.client).not.toBeNull()
    expect(mockFactory.createClient).toHaveBeenCalledWith(
      mockChainWithEndpoint.endpoints[0],
      mockChainWithEndpoint.chainId,
    )
    expect(result.current.client).toEqual({
      endpoint: mockChainWithEndpoint.endpoints[0],
      chainId: mockChainWithEndpoint.chainId,
    })
  })
})
