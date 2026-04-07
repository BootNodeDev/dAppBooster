import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { WalletAdapter } from '../../core/adapters/wallet'
import { DAppBoosterProvider } from '../provider/DAppBoosterProvider'
import { useChainRegistry } from './useChainRegistry'

vi.mock('@/src/wallet/providers', () => ({
  Web3Provider: ({ children }: { children: ReactNode }) => children,
}))

const mockChain = {
  caip2Id: 'eip155:1',
  chainId: 1,
  name: 'Ethereum',
  chainType: 'evm',
  nativeCurrency: { symbol: 'ETH', decimals: 18 },
  addressConfig: { format: 'hex', patterns: [], example: '0x...' },
}

const makeMockAdapter = (): WalletAdapter =>
  ({
    chainType: 'evm',
    supportedChains: [mockChain],
    metadata: {
      chainType: 'evm',
      capabilities: { signTypedData: false, switchChain: false },
      formatAddress: (addr: string) => addr,
      availableWallets: () => [],
    },
    connect: vi.fn(),
    reconnect: vi.fn(),
    disconnect: vi.fn(),
    getStatus: vi.fn(),
    onStatusChange: vi.fn(() => vi.fn()),
    signMessage: vi.fn(),
    getSigner: vi.fn(),
    switchChain: vi.fn(),
  }) as unknown as WalletAdapter

const makeWrapper =
  (adapter: WalletAdapter) =>
  ({ children }: { children: ReactNode }) =>
    createElement(DAppBoosterProvider, { config: { wallets: { evm: { adapter } } } }, children)

describe('useChainRegistry', () => {
  it('returns the registry from context', () => {
    const adapter = makeMockAdapter()
    const wrapper = makeWrapper(adapter)
    const { result } = renderHook(() => useChainRegistry(), { wrapper })
    expect(result.current).toBeDefined()
    expect(typeof result.current.getChain).toBe('function')
    expect(typeof result.current.getAllChains).toBe('function')
  })

  it('registry has correct chains from adapter', () => {
    const adapter = makeMockAdapter()
    const wrapper = makeWrapper(adapter)
    const { result } = renderHook(() => useChainRegistry(), { wrapper })
    const chain = result.current.getChain(1)
    expect(chain).not.toBeNull()
    expect(chain?.name).toBe('Ethereum')
    expect(chain?.caip2Id).toBe('eip155:1')
  })
})
