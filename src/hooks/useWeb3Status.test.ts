import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useWeb3Status, useWeb3StatusConnected } from './useWeb3Status'

const mockDisconnect = vi.fn()
const mockSwitchChain = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({
    address: undefined,
    chainId: undefined,
    isConnected: false,
    isConnecting: false,
  })),
  useChainId: vi.fn(() => 1),
  useSwitchChain: vi.fn(() => ({ isPending: false, switchChain: mockSwitchChain })),
  usePublicClient: vi.fn(() => undefined),
  useWalletClient: vi.fn(() => ({ data: undefined })),
  useBalance: vi.fn(() => ({ data: undefined })),
  useDisconnect: vi.fn(() => ({ disconnect: mockDisconnect })),
}))

import * as wagmi from 'wagmi'

type MockAccount = ReturnType<typeof wagmi.useAccount>
type MockSwitchChain = ReturnType<typeof wagmi.useSwitchChain>

describe('useWeb3Status', () => {
  beforeEach(() => {
    mockDisconnect.mockClear()
    mockSwitchChain.mockClear()
  })

  it('returns disconnected state when no wallet connected', () => {
    const { result } = renderHook(() => useWeb3Status())
    expect(result.current.isWalletConnected).toBe(false)
    expect(result.current.address).toBeUndefined()
    expect(result.current.walletChainId).toBeUndefined()
  })

  it('returns connected state with wallet address', () => {
    const mock = {
      address: '0xabc123' as `0x${string}`,
      chainId: 1,
      isConnected: true,
      isConnecting: false,
    } as unknown as MockAccount
    vi.mocked(wagmi.useAccount).mockReturnValueOnce(mock)
    const { result } = renderHook(() => useWeb3Status())
    expect(result.current.isWalletConnected).toBe(true)
    expect(result.current.address).toBe('0xabc123')
  })

  it('sets isWalletSynced true when wallet chainId matches app chainId', () => {
    const mock = {
      address: '0xabc123' as `0x${string}`,
      chainId: 1,
      isConnected: true,
      isConnecting: false,
    } as unknown as MockAccount
    vi.mocked(wagmi.useAccount).mockReturnValueOnce(mock)
    vi.mocked(wagmi.useChainId).mockReturnValueOnce(1)
    const { result } = renderHook(() => useWeb3Status())
    expect(result.current.isWalletSynced).toBe(true)
  })

  it('sets isWalletSynced false when wallet chainId differs from app chainId', () => {
    const mock = {
      address: '0xabc123' as `0x${string}`,
      chainId: 137,
      isConnected: true,
      isConnecting: false,
    } as unknown as MockAccount
    vi.mocked(wagmi.useAccount).mockReturnValueOnce(mock)
    vi.mocked(wagmi.useChainId).mockReturnValueOnce(1)
    const { result } = renderHook(() => useWeb3Status())
    expect(result.current.isWalletSynced).toBe(false)
  })

  it('sets switchingChain when useSwitchChain is pending', () => {
    const mock = { isPending: true, switchChain: mockSwitchChain } as unknown as MockSwitchChain
    vi.mocked(wagmi.useSwitchChain).mockReturnValueOnce(mock)
    const { result } = renderHook(() => useWeb3Status())
    expect(result.current.switchingChain).toBe(true)
  })

  it('exposes disconnect function', () => {
    const { result } = renderHook(() => useWeb3Status())
    result.current.disconnect()
    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('calls switchChain with chainId when switchChain action is invoked', () => {
    const { result } = renderHook(() => useWeb3Status())
    result.current.switchChain(137)
    expect(mockSwitchChain).toHaveBeenCalledWith({ chainId: 137 })
  })

  it('exposes appChainId from useChainId', () => {
    vi.mocked(wagmi.useChainId).mockReturnValueOnce(42161)
    const { result } = renderHook(() => useWeb3Status())
    expect(result.current.appChainId).toBe(42161)
  })
})

describe('useWeb3StatusConnected', () => {
  it('throws when wallet is not connected', () => {
    expect(() => renderHook(() => useWeb3StatusConnected())).toThrow(
      'Use useWeb3StatusConnected only when a wallet is connected',
    )
  })

  it('returns status when wallet is connected', () => {
    const mock = {
      address: '0xdeadbeef' as `0x${string}`,
      chainId: 1,
      isConnected: true,
      isConnecting: false,
    } as unknown as MockAccount
    // useWeb3StatusConnected calls useWeb3Status twice; both calls must see connected state
    vi.mocked(wagmi.useAccount).mockReturnValueOnce(mock).mockReturnValueOnce(mock)
    const { result } = renderHook(() => useWeb3StatusConnected())
    expect(result.current.isWalletConnected).toBe(true)
  })
})
