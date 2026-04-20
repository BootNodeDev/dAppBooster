import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createMockWeb3Status, renderWithProviders } from '@/src/test-utils'
import TokenBalance from './TokenBalance'

const mockAddress = '0x1234567890123456789012345678901234567890' as const
const nativeAddress = '0x0000000000000000000000000000000000000000'

const erc20Token = {
  name: 'USD Coin',
  symbol: 'USDC',
  address: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8' as `0x${string}`,
  decimals: 6,
  chainId: 11155111,
}

const nativeToken = {
  name: 'Sepolia Ether',
  symbol: 'ETH',
  address: nativeAddress as `0x${string}`,
  decimals: 18,
  chainId: 11155111,
}

const tokenWithExtensions = {
  ...erc20Token,
  extensions: {
    balance: 5_000_000n,
    priceUSD: '1.00',
  },
}

vi.mock('@/src/hooks/useWeb3Status', () => ({
  useWeb3Status: vi.fn(() =>
    createMockWeb3Status({ address: mockAddress, isWalletConnected: true }),
  ),
}))

vi.mock('@/src/hooks/useErc20Balance', () => ({
  useErc20Balance: vi.fn(() => ({
    balance: 0n,
    balanceError: null,
    isLoadingBalance: false,
  })),
}))

vi.mock('wagmi', () => ({
  useBalance: vi.fn(() => ({ data: undefined, isLoading: false })),
}))

vi.mock('@/src/env', () => ({
  env: {
    PUBLIC_NATIVE_TOKEN_ADDRESS: '0x0000000000000000000000000000000000000000',
    PUBLIC_APP_NAME: 'test',
  },
}))

function renderTokenBalance(props: {
  isLoading?: boolean
  token: typeof erc20Token | typeof nativeToken | typeof tokenWithExtensions
}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return renderWithProviders(
    <QueryClientProvider client={queryClient}>
      <TokenBalance {...props} />
    </QueryClientProvider>,
  )
}

describe('TokenBalance', () => {
  it('shows skeleton while isLoading is true', () => {
    renderTokenBalance({ isLoading: true, token: erc20Token })
    // Suspense fallback (BalanceLoading skeletons) renders — nothing from the component itself
    expect(screen.queryByText('N/A')).toBeNull()
    expect(screen.queryByText('$')).toBeNull()
  })

  it('renders LI.FI balance and USD value when extensions are present', () => {
    renderTokenBalance({ isLoading: false, token: tokenWithExtensions })
    // balance: 5_000_000 / 10^6 = 5 (viem trims trailing zeros)
    expect(screen.getByText('5')).toBeDefined()
    expect(screen.getByText('$ 5.00')).toBeDefined()
  })

  it('shows balance skeleton and N/A while on-chain fetch is in flight', async () => {
    const { useErc20Balance } = await import('@/src/hooks/useErc20Balance')
    vi.mocked(useErc20Balance).mockReturnValue({
      balance: undefined,
      balanceError: null,
      isLoadingBalance: true,
    })

    renderTokenBalance({ isLoading: false, token: erc20Token })
    // N/A is visible immediately; balance skeleton is rendered (no balance text)
    expect(screen.getByText('N/A')).toBeDefined()
    expect(screen.queryByText('0')).toBeNull()
  })

  it('renders on-chain ERC-20 balance and N/A when no extensions', async () => {
    const { useErc20Balance } = await import('@/src/hooks/useErc20Balance')
    vi.mocked(useErc20Balance).mockReturnValue({
      balance: 2_500_000n,
      balanceError: null,
      isLoadingBalance: false,
    })

    renderTokenBalance({ isLoading: false, token: erc20Token })
    // balance: 2_500_000 / 10^6 = 2.5
    expect(screen.getByText('2.5')).toBeDefined()
    expect(screen.getByText('N/A')).toBeDefined()
  })

  it('renders on-chain native balance and N/A when no extensions', async () => {
    const { useBalance } = await import('wagmi')
    vi.mocked(useBalance).mockReturnValue({
      data: { value: 1_000_000_000_000_000_000n, decimals: 18, formatted: '1.0', symbol: 'ETH' },
      isLoading: false,
    } as ReturnType<typeof useBalance>)

    renderTokenBalance({ isLoading: false, token: nativeToken })
    // balance: 1e18 / 10^18 = 1 (viem trims trailing zeros)
    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('N/A')).toBeDefined()
  })
})
