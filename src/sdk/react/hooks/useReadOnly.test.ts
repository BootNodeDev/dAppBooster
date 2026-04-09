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

const mockEndpoint = { url: 'https://eth.example.com', protocol: 'json-rpc' as const }

const mockChain = {
  caip2Id: 'eip155:1',
  chainId: 1,
  name: 'Ethereum',
  chainType: 'evm',
  nativeCurrency: { symbol: 'ETH', decimals: 18 },
  addressConfig: { format: 'hex' as const, patterns: [], example: '0x...' },
  endpoints: [mockEndpoint],
  explorer: {
    name: 'Etherscan',
    url: 'https://etherscan.io',
    txPath: '/tx/{id}',
    addressPath: '/address/{id}',
  },
}

type MockClient = { type: 'mock-client' }

const mockFactory: ReadClientFactory<MockClient> = {
  chainType: 'evm',
  createClient: vi.fn(() => ({ type: 'mock-client' }) as MockClient),
}

const makeWrapper =
  (
    config: {
      readClientFactories?: ReadClientFactory<unknown>[]
      chains?: (typeof mockChain)[]
    } = {},
  ) =>
  ({ children }: { children: ReactNode }) =>
    createElement(
      DAppBoosterProvider,
      {
        config: {
          chains: config.chains ?? [mockChain],
          readClientFactories: config.readClientFactories,
        },
      },
      children,
    )

describe('useReadOnly', () => {
  it('returns chain and null client when no factory matches', () => {
    const { result } = renderHook(() => useReadOnly({ chainId: 1 }), {
      wrapper: makeWrapper(),
    })
    expect(result.current.chain?.name).toBe('Ethereum')
    expect(result.current.client).toBeNull()
  })

  it('returns a client when factory matches', () => {
    const { result } = renderHook(() => useReadOnly({ chainId: 1 }), {
      wrapper: makeWrapper({ readClientFactories: [mockFactory] }),
    })
    expect(result.current.client).toEqual({ type: 'mock-client' })
  })

  it('returns null chain and null client for unknown chainId', () => {
    const { result } = renderHook(() => useReadOnly({ chainId: 999 }), {
      wrapper: makeWrapper(),
    })
    expect(result.current.chain).toBeNull()
    expect(result.current.client).toBeNull()
  })

  it('returns explorerAddressUrl when address and explorer are configured', () => {
    const { result } = renderHook(() => useReadOnly({ chainId: 1, address: '0xabc' }), {
      wrapper: makeWrapper(),
    })
    expect(result.current.explorerAddressUrl).toBe('https://etherscan.io/address/0xabc')
  })

  describe('factory option (Level 4 bypass)', () => {
    it('uses explicit factory instead of provider readClientFactories', () => {
      const providerFactory: ReadClientFactory<unknown> = {
        chainType: 'evm',
        createClient: vi.fn(() => ({ type: 'provider-client' })),
      }
      const explicitFactory: ReadClientFactory<MockClient> = {
        chainType: 'evm',
        createClient: vi.fn(() => ({ type: 'mock-client' }) as MockClient),
      }

      const { result } = renderHook(
        () => useReadOnly<MockClient>({ chainId: 1, factory: explicitFactory }),
        { wrapper: makeWrapper({ readClientFactories: [providerFactory] }) },
      )

      expect(result.current.client).toEqual({ type: 'mock-client' })
      expect(providerFactory.createClient).not.toHaveBeenCalled()
    })

    it('works even when provider has no readClientFactories', () => {
      const explicitFactory: ReadClientFactory<MockClient> = {
        chainType: 'evm',
        createClient: vi.fn(() => ({ type: 'mock-client' }) as MockClient),
      }

      const { result } = renderHook(
        () => useReadOnly<MockClient>({ chainId: 1, factory: explicitFactory }),
        { wrapper: makeWrapper() },
      )

      expect(result.current.client).toEqual({ type: 'mock-client' })
    })
  })
})
