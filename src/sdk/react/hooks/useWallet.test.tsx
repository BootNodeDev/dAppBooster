import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { WalletAdapter, WalletStatus } from '../../core/adapters/wallet'
import { AdapterNotFoundError, AmbiguousAdapterError } from '../../core/errors'
import { DAppBoosterProvider } from '../provider/DAppBoosterProvider'
import { useWallet } from './useWallet'

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
    getStatus: vi.fn(() => mockStatus),
    onStatusChange: vi.fn(() => unsubscribe),
    signMessage: vi.fn(),
    getSigner: vi.fn(),
    switchChain: vi.fn(),
    ...overrides,
  } as unknown as WalletAdapter
}

const makeWrapper =
  (
    wallets: Record<
      string,
      { adapter: WalletAdapter; useConnectModal?: () => { open: () => void } }
    >,
  ) =>
  ({ children }: { children: ReactNode }) =>
    createElement(DAppBoosterProvider, { config: { wallets } }, children)

describe('useWallet', () => {
  it('resolves the single adapter when no options given', () => {
    const adapter = makeMockAdapter()
    const wrapper = makeWrapper({ evm: { adapter } })
    const { result } = renderHook(() => useWallet(), { wrapper })
    expect(result.current.adapter).toBe(adapter)
  })

  it('throws AmbiguousAdapterError when multiple adapters exist and no options given', () => {
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
    expect(() => renderHook(() => useWallet(), { wrapper })).toThrow(AmbiguousAdapterError)
  })

  it('resolves by chainType', () => {
    const evmAdapter = makeMockAdapter({ chainType: 'evm' })
    const wrapper = makeWrapper({ evm: { adapter: evmAdapter } })
    const { result } = renderHook(() => useWallet({ chainType: 'evm' }), { wrapper })
    expect(result.current.adapter).toBe(evmAdapter)
  })

  it('resolves by chainId', () => {
    const adapter = makeMockAdapter()
    const wrapper = makeWrapper({ evm: { adapter } })
    const { result } = renderHook(() => useWallet({ chainId: 1 }), { wrapper })
    expect(result.current.adapter).toBe(adapter)
  })

  it('throws AdapterNotFoundError for unknown chainType', () => {
    const adapter = makeMockAdapter()
    const wrapper = makeWrapper({ evm: { adapter } })
    expect(() => renderHook(() => useWallet({ chainType: 'solana' }), { wrapper })).toThrow(
      AdapterNotFoundError,
    )
  })

  it('uses the explicit adapter option directly without resolution', () => {
    const evmAdapter = makeMockAdapter({ chainType: 'evm' })
    const explicitAdapter = makeMockAdapter({ chainType: 'solana' })
    const wrapper = makeWrapper({ evm: { adapter: evmAdapter } })
    const { result } = renderHook(() => useWallet({ adapter: explicitAdapter }), { wrapper })
    expect(result.current.adapter).toBe(explicitAdapter)
  })

  it('subscribes to status changes and updates status in hook result', () => {
    let capturedListener: ((status: WalletStatus) => void) | null = null
    const adapter = makeMockAdapter({
      onStatusChange: vi.fn((listener) => {
        capturedListener = listener
        return vi.fn()
      }),
    })
    const wrapper = makeWrapper({ evm: { adapter } })
    const { result } = renderHook(() => useWallet(), { wrapper })

    const updatedStatus: WalletStatus = {
      connected: true,
      activeAccount: '0xabc',
      connectedChainIds: [1],
      connecting: false,
    }

    act(() => {
      capturedListener?.(updatedStatus)
    })

    expect(result.current.status).toEqual(updatedStatus)
  })

  it('isReady is true when connected with no chainId constraint', () => {
    const connectedStatus: WalletStatus = {
      connected: true,
      activeAccount: '0xabc',
      connectedChainIds: [1],
      connecting: false,
    }
    const adapter = makeMockAdapter({ getStatus: vi.fn(() => connectedStatus) })
    const wrapper = makeWrapper({ evm: { adapter } })
    const { result } = renderHook(() => useWallet(), { wrapper })
    expect(result.current.isReady).toBe(true)
  })

  it('needsConnect is true when not connected', () => {
    const adapter = makeMockAdapter()
    const wrapper = makeWrapper({ evm: { adapter } })
    const { result } = renderHook(() => useWallet(), { wrapper })
    expect(result.current.needsConnect).toBe(true)
  })

  it('needsChainSwitch is true when connected but requested chainId not in connectedChainIds', () => {
    const connectedStatus: WalletStatus = {
      connected: true,
      activeAccount: '0xabc',
      connectedChainIds: [137],
      connecting: false,
    }
    const adapter = makeMockAdapter({ getStatus: vi.fn(() => connectedStatus) })
    const wrapper = makeWrapper({ evm: { adapter } })
    const { result } = renderHook(() => useWallet({ chainId: 1 }), { wrapper })
    expect(result.current.needsChainSwitch).toBe(true)
  })

  it('calls unsubscribe returned by onStatusChange on unmount', () => {
    const unsubscribe = vi.fn()
    const adapter = makeMockAdapter({
      onStatusChange: vi.fn(() => unsubscribe),
    })
    const wrapper = makeWrapper({ evm: { adapter } })
    const { unmount } = renderHook(() => useWallet(), { wrapper })
    unmount()
    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('openConnectModal calls the registered modal opener for the resolved adapter', () => {
    const openSpy = vi.fn()
    const adapter = makeMockAdapter()
    const wrapper = makeWrapper({
      evm: { adapter, useConnectModal: () => ({ open: openSpy }) },
    })
    const { result } = renderHook(() => useWallet(), { wrapper })
    act(() => {
      result.current.openConnectModal()
    })
    expect(openSpy).toHaveBeenCalledOnce()
  })

  it('openConnectModal is a no-op when no modal is registered for the adapter', () => {
    const adapter = makeMockAdapter()
    const wrapper = makeWrapper({ evm: { adapter } })
    const { result } = renderHook(() => useWallet(), { wrapper })
    expect(() => {
      act(() => {
        result.current.openConnectModal()
      })
    }).not.toThrow()
  })
})
