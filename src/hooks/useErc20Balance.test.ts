import type { Token } from '@/src/types/token'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { zeroAddress } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useErc20Balance } from './useErc20Balance'

const mockReadContract = vi.fn()

vi.mock('wagmi', () => ({
  usePublicClient: vi.fn(() => ({
    readContract: mockReadContract,
  })),
}))

vi.mock('@/src/env', () => ({
  env: { PUBLIC_NATIVE_TOKEN_ADDRESS: zeroAddress.toLowerCase() },
}))

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    children,
  )

const mockToken: Token = {
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  chainId: 1,
  decimals: 6,
  name: 'USD Coin',
  symbol: 'USDC',
}

const walletAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' as `0x${string}`

describe('useErc20Balance', () => {
  beforeEach(() => {
    mockReadContract.mockClear()
  })

  it('returns undefined balance when address is missing', () => {
    const { result } = renderHook(() => useErc20Balance({ token: mockToken }), { wrapper })
    expect(result.current.balance).toBeUndefined()
    expect(result.current.isLoadingBalance).toBe(false)
  })

  it('returns undefined balance when token is missing', () => {
    const { result } = renderHook(() => useErc20Balance({ address: walletAddress }), { wrapper })
    expect(result.current.balance).toBeUndefined()
    expect(result.current.isLoadingBalance).toBe(false)
  })

  it('does not fetch balance for native token address', () => {
    const nativeToken: Token = { ...mockToken, address: zeroAddress }
    const { result } = renderHook(
      () => useErc20Balance({ address: walletAddress, token: nativeToken }),
      { wrapper },
    )
    expect(mockReadContract).not.toHaveBeenCalled()
    expect(result.current.isLoadingBalance).toBe(false)
  })

  it('returns balance when query resolves', async () => {
    mockReadContract.mockResolvedValueOnce(BigInt(1_000_000))
    const { result } = renderHook(
      () => useErc20Balance({ address: walletAddress, token: mockToken }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.isLoadingBalance).toBe(false))
    expect(result.current.balance).toBe(BigInt(1_000_000))
    expect(result.current.balanceError).toBeNull()
  })

  it('returns error when query fails', async () => {
    mockReadContract.mockRejectedValueOnce(new Error('RPC error'))
    const { result } = renderHook(
      () => useErc20Balance({ address: walletAddress, token: mockToken }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.balanceError).toBeTruthy())
    expect(result.current.balance).toBeUndefined()
  })
})
