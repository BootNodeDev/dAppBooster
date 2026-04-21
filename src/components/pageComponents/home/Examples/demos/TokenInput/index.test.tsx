import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
    searchTerm: '',
    setSearchTerm: vi.fn(),
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

// TokenSelect calls useTokens internally; return empty arrays per chain to avoid
// TopTokens receiving undefined and crashing on .find()
vi.mock('@/src/hooks/useTokens', () => ({
  useTokens: vi.fn(() => ({
    tokens: [],
    tokensByChainId: { 1: [], 10: [], 42161: [], 137: [], 11155111: [] },
    isLoadingBalances: false,
  })),
}))

vi.mock('@/src/constants/common', () => ({
  includeTestnets: true,
  isDev: false,
  NO_PRICE_DATA_LABEL: 'N/A',
}))

describe('TokenInput demo', () => {
  it('renders the token input container', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    renderWithProviders(
      <QueryClientProvider client={queryClient}>{tokenInput.demo}</QueryClientProvider>,
    )
    expect(screen.getByText('Multi token')).toBeDefined()
  })

  it('shows Sepolia in the network selector when includeTestnets is true', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    renderWithProviders(
      <QueryClientProvider client={queryClient}>{tokenInput.demo}</QueryClientProvider>,
    )

    // Open the TokenSelect dialog
    await user.click(screen.getByText('Select'))

    // There are two "Chevron down" SVGs: one in the DropdownButton trigger (pointer-events:none)
    // and one in the NetworkButton inside the dialog. Click the last one (the network switcher).
    const chevrons = await screen.findAllByTitle('Chevron down')
    const networkChevron = chevrons[chevrons.length - 1]
    const networkButton = networkChevron.closest('button')
    expect(networkButton).not.toBeNull()
    await user.click(networkButton as HTMLButtonElement)

    // Sepolia should be listed as a network option
    await waitFor(() => expect(screen.getByText('Sepolia')).toBeDefined())
  })
})
