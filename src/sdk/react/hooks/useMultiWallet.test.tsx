import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { WalletAdapter, WalletStatus } from '../../core/adapters/wallet'
import type { ChainDescriptor } from '../../core/chain/descriptor'
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

const evmChain: ChainDescriptor = {
  caip2Id: 'eip155:1',
  chainId: 1,
  name: 'Ethereum',
  chainType: 'evm',
  nativeCurrency: { symbol: 'ETH', decimals: 18 },
  addressConfig: { format: 'hex', patterns: [], example: '0x...' },
}

const svmChain: ChainDescriptor = {
  caip2Id: 'solana:mainnet',
  chainId: 'solana:mainnet',
  name: 'Solana',
  chainType: 'solana',
  nativeCurrency: { symbol: 'SOL', decimals: 9 },
  addressConfig: { format: 'base58', patterns: [], example: '...' },
}

const makeMockAdapter = (overrides?: Partial<WalletAdapter>): WalletAdapter => {
  const unsubscribe = vi.fn()
  return {
    chainType: 'evm',
    supportedChains: [evmChain],
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

const makeMockWalletAdapter = ({
  chainType,
  supportedChains,
  connected,
  activeAccount,
}: {
  chainType: string
  supportedChains: ChainDescriptor[]
  connected: boolean
  activeAccount: string | null
}): WalletAdapter => {
  const status: WalletStatus = {
    connected,
    activeAccount,
    connectedChainIds: connected ? supportedChains.map((c) => c.chainId) : [],
    connecting: false,
  }
  return makeMockAdapter({
    chainType,
    supportedChains,
    metadata: {
      chainType,
      capabilities: { signTypedData: false, switchChain: false },
      formatAddress: (addr: string) => addr,
      availableWallets: () => [],
    },
    getStatus: vi.fn(() => status),
  })
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
  it('returns empty wallets record with no adapters', () => {
    const wrapper = makeEmptyWrapper()
    const { result } = renderHook(() => useMultiWallet(), { wrapper })
    expect(result.current.wallets).toEqual({})
  })

  it('returns one entry per adapter', () => {
    const evmAdapter = makeMockAdapter({ chainType: 'evm' })
    const solAdapter = makeMockAdapter({
      chainType: 'solana',
      supportedChains: [svmChain],
    })
    const wrapper = makeWrapper({ evm: { adapter: evmAdapter }, solana: { adapter: solAdapter } })
    const { result } = renderHook(() => useMultiWallet(), { wrapper })
    expect(Object.keys(result.current.wallets)).toHaveLength(2)
    expect(result.current.wallets).toHaveProperty('evm')
    expect(result.current.wallets).toHaveProperty('solana')
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
    expect(result.current.wallets.evm.status).toEqual(connectedStatus)
    expect(result.current.wallets.evm.isReady).toBe(true)
    expect(result.current.wallets.evm.needsConnect).toBe(false)
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

    expect(result.current.wallets.evm.status).toEqual(updatedStatus)
  })

  it('calls unsubscribes for all adapters on unmount', () => {
    const unsubscribeEvm = vi.fn()
    const unsubscribeSol = vi.fn()
    const evmAdapter = makeMockAdapter({ onStatusChange: vi.fn(() => unsubscribeEvm) })
    const solAdapter = makeMockAdapter({
      chainType: 'solana',
      supportedChains: [svmChain],
      onStatusChange: vi.fn(() => unsubscribeSol),
    })
    const wrapper = makeWrapper({ evm: { adapter: evmAdapter }, solana: { adapter: solAdapter } })
    const { unmount } = renderHook(() => useMultiWallet(), { wrapper })
    unmount()
    expect(unsubscribeEvm).toHaveBeenCalledOnce()
    expect(unsubscribeSol).toHaveBeenCalledOnce()
  })
})

describe('useMultiWallet convenience methods', () => {
  it('getWallet returns the wallet entry matching chainType', () => {
    const evmAdapter = makeMockWalletAdapter({
      chainType: 'evm',
      supportedChains: [evmChain],
      connected: true,
      activeAccount: '0xabc',
    })
    const solanaAdapter = makeMockWalletAdapter({
      chainType: 'solana',
      supportedChains: [svmChain],
      connected: true,
      activeAccount: 'ABC123',
    })
    const wrapper = makeWrapper({
      evm: { adapter: evmAdapter },
      solana: { adapter: solanaAdapter },
    })
    const { result } = renderHook(() => useMultiWallet(), { wrapper })

    const evmWallet = result.current.getWallet('evm')
    expect(evmWallet).toBeDefined()
    expect(evmWallet?.adapter.chainType).toBe('evm')
  })

  it('getWallet returns undefined for unregistered chainType', () => {
    const evmAdapter = makeMockWalletAdapter({
      chainType: 'evm',
      supportedChains: [evmChain],
      connected: false,
      activeAccount: null,
    })
    const wrapper = makeWrapper({ evm: { adapter: evmAdapter } })
    const { result } = renderHook(() => useMultiWallet(), { wrapper })

    expect(result.current.getWallet('solana')).toBeUndefined()
  })

  it('getWalletByChainId returns the wallet entry whose adapter supports that chainId', () => {
    const evmAdapter = makeMockWalletAdapter({
      chainType: 'evm',
      supportedChains: [evmChain],
      connected: true,
      activeAccount: '0xabc',
    })
    const wrapper = makeWrapper({ evm: { adapter: evmAdapter } })
    const { result } = renderHook(() => useMultiWallet(), { wrapper })

    const wallet = result.current.getWalletByChainId(1)
    expect(wallet).toBeDefined()
    expect(wallet?.adapter.chainType).toBe('evm')
  })

  it('getWalletByChainId returns undefined for unsupported chainId', () => {
    const evmAdapter = makeMockWalletAdapter({
      chainType: 'evm',
      supportedChains: [evmChain],
      connected: false,
      activeAccount: null,
    })
    const wrapper = makeWrapper({ evm: { adapter: evmAdapter } })
    const { result } = renderHook(() => useMultiWallet(), { wrapper })

    expect(result.current.getWalletByChainId(999)).toBeUndefined()
  })

  it('connectedAddresses returns a record of adapter name to activeAccount for connected wallets', () => {
    const evmAdapter = makeMockWalletAdapter({
      chainType: 'evm',
      supportedChains: [evmChain],
      connected: true,
      activeAccount: '0xabc',
    })
    const solanaAdapter = makeMockWalletAdapter({
      chainType: 'solana',
      supportedChains: [svmChain],
      connected: true,
      activeAccount: 'ABC123',
    })
    const wrapper = makeWrapper({
      evm: { adapter: evmAdapter },
      solana: { adapter: solanaAdapter },
    })
    const { result } = renderHook(() => useMultiWallet(), { wrapper })

    expect(result.current.connectedAddresses).toEqual({
      evm: '0xabc',
      solana: 'ABC123',
    })
  })

  it('connectedAddresses omits disconnected wallets', () => {
    const evmAdapter = makeMockWalletAdapter({
      chainType: 'evm',
      supportedChains: [evmChain],
      connected: true,
      activeAccount: '0xabc',
    })
    const solanaAdapter = makeMockWalletAdapter({
      chainType: 'solana',
      supportedChains: [svmChain],
      connected: false,
      activeAccount: null,
    })
    const wrapper = makeWrapper({
      evm: { adapter: evmAdapter },
      solana: { adapter: solanaAdapter },
    })
    const { result } = renderHook(() => useMultiWallet(), { wrapper })

    expect(result.current.connectedAddresses).toEqual({ evm: '0xabc' })
    expect(result.current.connectedAddresses).not.toHaveProperty('solana')
  })

  it('wallets record is still accessible on the return value', () => {
    const evmAdapter = makeMockWalletAdapter({
      chainType: 'evm',
      supportedChains: [evmChain],
      connected: false,
      activeAccount: null,
    })
    const wrapper = makeWrapper({ evm: { adapter: evmAdapter } })
    const { result } = renderHook(() => useMultiWallet(), { wrapper })

    expect(result.current.wallets.evm).toBeDefined()
    expect(result.current.wallets.evm.adapter.chainType).toBe('evm')
  })
})
