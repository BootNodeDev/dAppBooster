import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { WalletAdapter, WalletStatus } from '../../core/adapters/wallet'
import { DAppBoosterProvider } from '../provider/DAppBoosterProvider'
import { useMultiWallet } from './useMultiWallet'

vi.mock('@/src/wallet/providers', () => ({
  Web3Provider: ({ children }: { children: ReactNode }) => children,
}))

const mockStatus: WalletStatus = {
  connected: false,
  activeAccount: null,
  connectedChainIds: [],
  connecting: false,
}

const makeMockAdapter = (overrides?: Partial<WalletAdapter>): WalletAdapter => {
  const unsubscribe = vi.fn()
  return {
    chainType: 'evm',
    supportedChains: [
      {
        caip2Id: 'eip155:1',
        chainId: 1,
        name: 'Ethereum',
        chainType: 'evm',
        nativeCurrency: { symbol: 'ETH', decimals: 18 },
        addressConfig: { format: 'hex', patterns: [], example: '0x...' },
      },
    ],
    metadata: {
      chainType: 'evm',
      capabilities: { signTypedData: false, switchChain: false },
      formatAddress: (addr: string) => addr,
      availableWallets: () => [],
    },
    connect: vi.fn(),
    reconnect: vi.fn(),
    disconnect: vi.fn(),
    getStatus: vi.fn(() => mockStatus),
    onStatusChange: vi.fn(() => unsubscribe),
    signMessage: vi.fn(),
    getSigner: vi.fn(),
    switchChain: vi.fn(),
    ...overrides,
  } as unknown as WalletAdapter
}

const makeWrapper =
  (wallets: Record<string, { adapter: WalletAdapter }>) =>
  ({ children }: { children: ReactNode }) =>
    createElement(DAppBoosterProvider, { config: { wallets } }, children)

const makeEmptyWrapper =
  () =>
  ({ children }: { children: ReactNode }) =>
    createElement(DAppBoosterProvider, { config: {} }, children)

describe('useMultiWallet', () => {
  it('returns empty record with no adapters', () => {
    const wrapper = makeEmptyWrapper()
    const { result } = renderHook(() => useMultiWallet(), { wrapper })
    expect(result.current).toEqual({})
  })

  it('returns one entry per adapter', () => {
    const evmAdapter = makeMockAdapter({ chainType: 'evm' })
    const solAdapter = makeMockAdapter({
      chainType: 'solana',
      supportedChains: [
        {
          caip2Id: 'solana:mainnet',
          chainId: 'solana:mainnet',
          name: 'Solana',
          chainType: 'solana',
          nativeCurrency: { symbol: 'SOL', decimals: 9 },
          addressConfig: { format: 'base58', patterns: [], example: '...' },
        },
      ],
    })
    const wrapper = makeWrapper({ evm: { adapter: evmAdapter }, solana: { adapter: solAdapter } })
    const { result } = renderHook(() => useMultiWallet(), { wrapper })
    expect(Object.keys(result.current)).toHaveLength(2)
    expect(result.current).toHaveProperty('evm')
    expect(result.current).toHaveProperty('solana')
  })

  it('status is correct for connected adapter', () => {
    const connectedStatus: WalletStatus = {
      connected: true,
      activeAccount: '0xabc',
      connectedChainIds: [1],
      connecting: false,
    }
    const adapter = makeMockAdapter({ getStatus: vi.fn(() => connectedStatus) })
    const wrapper = makeWrapper({ evm: { adapter } })
    const { result } = renderHook(() => useMultiWallet(), { wrapper })
    expect(result.current.evm.status).toEqual(connectedStatus)
    expect(result.current.evm.isReady).toBe(true)
    expect(result.current.evm.needsConnect).toBe(false)
  })

  it('status subscription updates when onStatusChange fires', () => {
    let capturedListener: ((status: WalletStatus) => void) | null = null
    const adapter = makeMockAdapter({
      onStatusChange: vi.fn((listener) => {
        capturedListener = listener
        return vi.fn()
      }),
    })
    const wrapper = makeWrapper({ evm: { adapter } })
    const { result } = renderHook(() => useMultiWallet(), { wrapper })

    const updatedStatus: WalletStatus = {
      connected: true,
      activeAccount: '0xabc',
      connectedChainIds: [1],
      connecting: false,
    }

    act(() => {
      capturedListener?.(updatedStatus)
    })

    expect(result.current.evm.status).toEqual(updatedStatus)
  })

  it('calls unsubscribes for all adapters on unmount', () => {
    const unsubscribeEvm = vi.fn()
    const unsubscribeSol = vi.fn()
    const evmAdapter = makeMockAdapter({ onStatusChange: vi.fn(() => unsubscribeEvm) })
    const solAdapter = makeMockAdapter({
      chainType: 'solana',
      supportedChains: [
        {
          caip2Id: 'solana:mainnet',
          chainId: 'solana:mainnet',
          name: 'Solana',
          chainType: 'solana',
          nativeCurrency: { symbol: 'SOL', decimals: 9 },
          addressConfig: { format: 'base58', patterns: [], example: '...' },
        },
      ],
      onStatusChange: vi.fn(() => unsubscribeSol),
    })
    const wrapper = makeWrapper({ evm: { adapter: evmAdapter }, solana: { adapter: solAdapter } })
    const { unmount } = renderHook(() => useMultiWallet(), { wrapper })
    unmount()
    expect(unsubscribeEvm).toHaveBeenCalledOnce()
    expect(unsubscribeSol).toHaveBeenCalledOnce()
  })
})
