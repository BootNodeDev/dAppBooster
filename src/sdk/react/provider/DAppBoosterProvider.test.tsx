import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { WalletAdapter } from '../../core/adapters/wallet'
import { ChainRegistryConflictError } from '../../core/errors'
import { useProviderContext } from './context'
import { DAppBoosterProvider } from './DAppBoosterProvider'

vi.mock('@/src/wallet/providers', () => ({
  Web3Provider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

const mockChain = {
  caip2Id: 'eip155:1',
  chainId: 1,
  name: 'Ethereum',
  chainType: 'evm',
  nativeCurrency: { symbol: 'ETH', decimals: 18 },
  addressConfig: { format: 'hex', patterns: [], example: '0x...' },
}

const mockAdapter = {
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
  onStatusChange: vi.fn(),
  signMessage: vi.fn(),
  getSigner: vi.fn(),
  switchChain: vi.fn(),
} as unknown as WalletAdapter

describe('useProviderContext', () => {
  it('throws when called outside DAppBoosterProvider', () => {
    expect(() => renderHook(() => useProviderContext())).toThrow(
      'useProviderContext must be called inside a DAppBoosterProvider.',
    )
  })

  it('returns the context when inside DAppBoosterProvider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DAppBoosterProvider config={{ wallets: { evm: { adapter: mockAdapter } } }}>
        {children}
      </DAppBoosterProvider>
    )
    const { result } = renderHook(() => useProviderContext(), { wrapper })
    expect(result.current.registry.getChain(1)).not.toBeNull()
  })

  it('builds registry from adapter supportedChains', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DAppBoosterProvider config={{ wallets: { evm: { adapter: mockAdapter } } }}>
        {children}
      </DAppBoosterProvider>
    )
    const { result } = renderHook(() => useProviderContext(), { wrapper })
    expect(result.current.registry.getChain(1)?.name).toBe('Ethereum')
    expect(result.current.walletAdapters.evm).toBe(mockAdapter)
  })

  it('passes lifecycle hooks through to context', () => {
    const onSubmit = vi.fn()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DAppBoosterProvider config={{ lifecycle: { onSubmit } }}>{children}</DAppBoosterProvider>
    )
    const { result } = renderHook(() => useProviderContext(), { wrapper })
    expect(result.current.lifecycle?.onSubmit).toBe(onSubmit)
  })

  it('works with no config (empty default)', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DAppBoosterProvider>{children}</DAppBoosterProvider>
    )
    const { result } = renderHook(() => useProviderContext(), { wrapper })
    expect(result.current.registry.getAllChains()).toHaveLength(0)
    expect(result.current.walletAdapters).toEqual({})
  })

  it('deduplicates structurally identical chain descriptors from wallet and transaction adapters', () => {
    const sharedChain = { ...mockChain }
    const walletAdapter = {
      ...mockAdapter,
      supportedChains: [sharedChain],
    } as unknown as WalletAdapter

    const txAdapter = {
      chainType: 'evm',
      supportedChains: [{ ...sharedChain }], // same content, different reference
      metadata: { chainType: 'evm', feeModel: 'eip1559', confirmationModel: 'blockConfirmations' },
      prepare: vi.fn(),
      execute: vi.fn(),
      confirm: vi.fn(),
    }

    const wrapper = ({ children }: { children: ReactNode }) => (
      <DAppBoosterProvider
        config={{
          wallets: { evm: { adapter: walletAdapter } },
          transactions: { evm: txAdapter as never },
        }}
      >
        {children}
      </DAppBoosterProvider>
    )

    const { result } = renderHook(() => useProviderContext(), { wrapper })
    expect(result.current.registry.getAllChains()).toHaveLength(1)
    expect(result.current.registry.getChain(1)?.name).toBe('Ethereum')
  })

  it('throws ChainRegistryConflictError when same caip2Id has structurally different descriptors', () => {
    const walletAdapter = {
      ...mockAdapter,
      supportedChains: [mockChain],
    } as unknown as WalletAdapter

    const txAdapter = {
      chainType: 'evm',
      supportedChains: [
        {
          ...mockChain,
          name: 'Ethereum (custom)', // same caip2Id, different content
        },
      ],
      metadata: { chainType: 'evm', feeModel: 'eip1559', confirmationModel: 'blockConfirmations' },
      prepare: vi.fn(),
      execute: vi.fn(),
      confirm: vi.fn(),
    }

    const wrapper = ({ children }: { children: ReactNode }) => (
      <DAppBoosterProvider
        config={{
          wallets: { evm: { adapter: walletAdapter } },
          transactions: { evm: txAdapter as never },
        }}
      >
        {children}
      </DAppBoosterProvider>
    )

    expect(() => renderHook(() => useProviderContext(), { wrapper })).toThrow(
      ChainRegistryConflictError,
    )
  })

  it('throws ChainRegistryConflictError when two adapters register the same chainId', () => {
    const conflictingAdapter = {
      ...mockAdapter,
      supportedChains: [
        {
          caip2Id: 'eip155:1-duplicate', // different caip2Id so dedup doesn't catch it
          chainId: 1, // same chainId as mockAdapter's chain — CONFLICT
          name: 'Ethereum (duplicate)',
          chainType: 'evm',
          nativeCurrency: { symbol: 'ETH', decimals: 18 },
          addressConfig: { format: 'hex', patterns: [], example: '0x...' },
        },
      ],
    } as unknown as WalletAdapter

    const wrapper = ({ children }: { children: ReactNode }) => (
      <DAppBoosterProvider
        config={{
          wallets: {
            evm: { adapter: mockAdapter },
            evmDuplicate: { adapter: conflictingAdapter },
          },
        }}
      >
        {children}
      </DAppBoosterProvider>
    )

    expect(() => renderHook(() => useProviderContext(), { wrapper })).toThrow(
      ChainRegistryConflictError,
    )
  })

  it('throws when adapter supportedChains contain a chainType that does not match the adapter chainType', () => {
    const mismatchedAdapter = {
      ...mockAdapter,
      chainType: 'evm',
      supportedChains: [
        {
          caip2Id: 'solana:mainnet',
          chainId: 'solana:mainnet',
          name: 'Solana',
          chainType: 'svm', // doesn't match adapter's 'evm'
          nativeCurrency: { symbol: 'SOL', decimals: 9 },
          addressConfig: { format: 'base58', patterns: [], example: '...' },
        },
      ],
    } as unknown as WalletAdapter

    const wrapper = ({ children }: { children: ReactNode }) => (
      <DAppBoosterProvider config={{ wallets: { evm: { adapter: mismatchedAdapter } } }}>
        {children}
      </DAppBoosterProvider>
    )

    expect(() => renderHook(() => useProviderContext(), { wrapper })).toThrow('chainType mismatch')
  })
})

describe('auto-contribute readClientFactories', () => {
  it('collects readClientFactory from wallet bundles', () => {
    const mockFactory = {
      chainType: 'evm',
      createClient: vi.fn(() => ({ type: 'auto-client' })),
    }

    const wrapper = ({ children }: { children: ReactNode }) => (
      <DAppBoosterProvider
        config={{
          wallets: {
            evm: {
              adapter: mockAdapter,
              readClientFactory: mockFactory,
            },
          },
        }}
      >
        {children}
      </DAppBoosterProvider>
    )

    const { result } = renderHook(() => useProviderContext(), { wrapper })
    expect(result.current.readClientFactories).toHaveLength(1)
    expect(result.current.readClientFactories[0].chainType).toBe('evm')
  })

  it('explicit readClientFactories take precedence over bundle factories', () => {
    const bundleFactory = {
      chainType: 'evm',
      createClient: vi.fn(() => ({ type: 'bundle-client' })),
    }
    const explicitFactory = {
      chainType: 'evm',
      createClient: vi.fn(() => ({ type: 'explicit-client' })),
    }

    const wrapper = ({ children }: { children: ReactNode }) => (
      <DAppBoosterProvider
        config={{
          wallets: {
            evm: {
              adapter: mockAdapter,
              readClientFactory: bundleFactory,
            },
          },
          readClientFactories: [explicitFactory],
        }}
      >
        {children}
      </DAppBoosterProvider>
    )

    const { result } = renderHook(() => useProviderContext(), { wrapper })
    expect(result.current.readClientFactories).toHaveLength(1)
    expect(result.current.readClientFactories[0].createClient(null as never, 1)).toEqual({
      type: 'explicit-client',
    })
  })

  it('deduplicates factories by chainType', () => {
    const factory1 = { chainType: 'evm', createClient: vi.fn() }
    const factory2 = { chainType: 'evm', createClient: vi.fn() }

    const wrapper = ({ children }: { children: ReactNode }) => (
      <DAppBoosterProvider
        config={{
          wallets: {
            evm1: { adapter: mockAdapter, readClientFactory: factory1 },
            evm2: {
              adapter: { ...mockAdapter } as unknown as WalletAdapter,
              readClientFactory: factory2,
            },
          },
        }}
      >
        {children}
      </DAppBoosterProvider>
    )

    const { result } = renderHook(() => useProviderContext(), { wrapper })
    expect(result.current.readClientFactories).toHaveLength(1)
  })
})
