import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/src/test-utils'
import tokenInput from './index'

vi.mock('@/src/sdk/react/hooks', () => ({
  useWallet: vi.fn(() => ({
    status: { connected: false, activeAccount: null, connectedChainIds: [], connecting: false },
  })),
}))

vi.mock('@/src/tokens/hooks/useTokenLists', () => ({
  useTokenLists: vi.fn(() => ({
    tokens: [],
    tokensByChainId: {},
    tokensByAddress: {},
    tokensBySymbol: {},
  })),
}))

vi.mock('@/src/tokens/hooks/useTokenSearch', () => ({
  useTokenSearch: vi.fn(() => ({
    searchResult: [],
  })),
}))

vi.mock('@/src/tokens/components/TokenInput/useTokenInput', () => ({
  useTokenInput: vi.fn(() => ({
    amount: 0n,
    setAmount: vi.fn(),
    amountError: null,
    setAmountError: vi.fn(),
    balance: 0n,
    balanceError: null,
    isLoadingBalance: false,
    selectedToken: undefined,
    setTokenSelected: vi.fn(),
  })),
}))

describe('TokenInput demo', () => {
  it('renders the token input container', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    renderWithProviders(
      <QueryClientProvider client={queryClient}>{tokenInput.demo}</QueryClientProvider>,
    )
    // The mode dropdown should be visible
    expect(screen.getByText('Single token')).toBeDefined()
  })
})
