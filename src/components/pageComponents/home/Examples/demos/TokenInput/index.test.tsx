import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createMockWeb3Status, renderWithProviders } from '@/src/test-utils'
import tokenInput from './index'

vi.mock('@/src/hooks/useWeb3Status', () => ({
  useWeb3Status: vi.fn(() => createMockWeb3Status()),
}))

vi.mock('@/src/hooks/useTokenLists', () => ({
  useTokenLists: vi.fn(() => ({
    tokens: [],
    tokensByChainId: {},
    tokensByAddress: {},
    tokensBySymbol: {},
  })),
}))

vi.mock('@/src/hooks/useTokenSearch', () => ({
  useTokenSearch: vi.fn(() => ({
    searchResult: [],
  })),
}))

vi.mock('@/src/components/sharedComponents/TokenInput/useTokenInput', () => ({
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
    // The mode dropdown should be visible with the default mode selected
    expect(screen.getByText('Multi token')).toBeDefined()
  })
})
