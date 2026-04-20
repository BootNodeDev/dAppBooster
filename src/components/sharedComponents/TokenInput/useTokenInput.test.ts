import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { zeroAddress } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Token } from '@/src/types/token'
import { useTokenInput } from './useTokenInput'

const walletAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' as const

const mockUsePublicClient = vi.fn()
const mockGetBalance = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: walletAddress }),
  usePublicClient: (args: { chainId?: number } = {}) => {
    mockUsePublicClient(args)
    return { getBalance: mockGetBalance }
  },
}))

vi.mock('@/src/hooks/useErc20Balance', () => ({
  useErc20Balance: () => ({ balance: undefined, balanceError: null, isLoadingBalance: false }),
}))

vi.mock('@/src/env', () => ({
  env: { PUBLIC_NATIVE_TOKEN_ADDRESS: zeroAddress.toLowerCase() },
}))

const mainnetUsdc: Token = {
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  chainId: 1,
  decimals: 6,
  name: 'USD Coin',
  symbol: 'USDC',
}

const sepoliaEth: Token = {
  address: zeroAddress,
  chainId: 11155111,
  decimals: 18,
  name: 'Sepolia Ether',
  symbol: 'ETH',
}

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    children,
  )

describe('useTokenInput', () => {
  beforeEach(() => {
    mockUsePublicClient.mockClear()
    mockGetBalance.mockReset()
  })

  it('rebinds the native public client to the selected token chain when the user switches chains', async () => {
    mockGetBalance.mockResolvedValue(42n)

    const { result } = renderHook(() => useTokenInput(mainnetUsdc), { wrapper })

    act(() => {
      result.current.setTokenSelected(sepoliaEth)
    })

    await waitFor(() =>
      expect(mockUsePublicClient).toHaveBeenLastCalledWith({ chainId: sepoliaEth.chainId }),
    )
    await waitFor(() => expect(result.current.balance).toBe(42n))
  })

  it('binds the native public client to the selected token chain when no initial token is given', async () => {
    mockGetBalance.mockResolvedValue(7n)

    const { result } = renderHook(() => useTokenInput(), { wrapper })

    act(() => {
      result.current.setTokenSelected(sepoliaEth)
    })

    await waitFor(() =>
      expect(mockUsePublicClient).toHaveBeenLastCalledWith({ chainId: sepoliaEth.chainId }),
    )
    await waitFor(() => expect(result.current.balance).toBe(7n))
  })
})
