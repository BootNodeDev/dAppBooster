import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useWalletStatus } from './useWalletStatus'

// Mock useWeb3Status
const mockSwitchChain = vi.fn()
const mockDisconnect = vi.fn()

vi.mock('@/src/hooks/useWeb3Status', () => ({
  useWeb3Status: vi.fn(() => ({
    appChainId: 1,
    isWalletConnected: false,
    isWalletSynced: false,
    switchChain: mockSwitchChain,
    walletChainId: undefined,
  })),
}))

vi.mock('@/src/lib/networks.config', () => ({
  chains: [
    { id: 1, name: 'Ethereum' },
    { id: 10, name: 'OP Mainnet' },
    { id: 137, name: 'Polygon' },
  ],
}))

vi.mock('viem', async () => {
  const actual = await vi.importActual('viem')
  return {
    ...actual,
    extractChain: vi.fn(({ chains, id }) => {
      const chain = chains.find((c: { id: number }) => c.id === id)
      if (!chain) {
        throw new Error(`Chain with id ${id} not found`)
      }
      return chain
    }),
  }
})

// Import after mocks are set up
const { useWeb3Status } = await import('@/src/hooks/useWeb3Status')
const mockedUseWeb3Status = vi.mocked(useWeb3Status)

const baseWeb3Status: ReturnType<typeof useWeb3Status> = {
  readOnlyClient: undefined,
  appChainId: 1,
  address: undefined,
  balance: undefined,
  connectingWallet: false,
  switchingChain: false,
  isWalletConnected: false,
  walletClient: undefined,
  isWalletSynced: false,
  walletChainId: undefined,
  switchChain: mockSwitchChain,
  disconnect: mockDisconnect,
}

describe('useWalletStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns needsConnect when wallet is not connected', () => {
    mockedUseWeb3Status.mockReturnValue({
      ...baseWeb3Status,
      appChainId: 1,
      isWalletConnected: false,
      isWalletSynced: false,
      walletChainId: undefined,
    })

    const { result } = renderHook(() => useWalletStatus())

    expect(result.current.needsConnect).toBe(true)
    expect(result.current.needsChainSwitch).toBe(false)
    expect(result.current.isReady).toBe(false)
  })

  it('returns needsChainSwitch when connected but on wrong chain', () => {
    mockedUseWeb3Status.mockReturnValue({
      ...baseWeb3Status,
      appChainId: 1,
      isWalletConnected: true,
      isWalletSynced: false,
      walletChainId: 137,
    })

    const { result } = renderHook(() => useWalletStatus())

    expect(result.current.needsConnect).toBe(false)
    expect(result.current.needsChainSwitch).toBe(true)
    expect(result.current.isReady).toBe(false)
    expect(result.current.targetChain).toEqual({ id: 1, name: 'Ethereum' })
  })

  it('returns isReady when connected and on correct chain', () => {
    mockedUseWeb3Status.mockReturnValue({
      ...baseWeb3Status,
      appChainId: 1,
      isWalletConnected: true,
      isWalletSynced: true,
      walletChainId: 1,
    })

    const { result } = renderHook(() => useWalletStatus())

    expect(result.current.needsConnect).toBe(false)
    expect(result.current.needsChainSwitch).toBe(false)
    expect(result.current.isReady).toBe(true)
  })

  it('uses provided chainId over appChainId', () => {
    mockedUseWeb3Status.mockReturnValue({
      ...baseWeb3Status,
      appChainId: 1,
      isWalletConnected: true,
      isWalletSynced: true,
      walletChainId: 1,
    })

    const { result } = renderHook(() => useWalletStatus({ chainId: 10 }))

    expect(result.current.needsChainSwitch).toBe(true)
    expect(result.current.isReady).toBe(false)
    expect(result.current.targetChain).toEqual({ id: 10, name: 'OP Mainnet' })
  })

  it('falls back to chains[0].id when no chainId or appChainId', () => {
    mockedUseWeb3Status.mockReturnValue({
      ...baseWeb3Status,
      appChainId: undefined as unknown as ReturnType<typeof useWeb3Status>['appChainId'],
      isWalletConnected: true,
      isWalletSynced: false,
      walletChainId: 137,
    })

    const { result } = renderHook(() => useWalletStatus())

    expect(result.current.targetChain).toEqual({ id: 1, name: 'Ethereum' })
  })

  it('switchChain calls through to useWeb3Status switchChain', () => {
    mockedUseWeb3Status.mockReturnValue({
      ...baseWeb3Status,
      appChainId: 1,
      isWalletConnected: true,
      isWalletSynced: false,
      walletChainId: 137,
    })

    const { result } = renderHook(() => useWalletStatus())

    result.current.switchChain(10)
    expect(mockSwitchChain).toHaveBeenCalledWith(10)
  })
})
