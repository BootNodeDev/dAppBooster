import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import tokenInput from './index'

const system = createSystem(defaultConfig)

vi.mock('@/src/hooks/useWeb3Status', () => ({
  useWeb3Status: vi.fn(() => ({
    isWalletConnected: false,
  })),
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
    value: '',
    token: undefined,
    error: undefined,
    onChange: vi.fn(),
    onTokenSelect: vi.fn(),
  })),
}))

describe('TokenInput demo', () => {
  it('renders the token input container', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={system}>{tokenInput.demo}</ChakraProvider>
      </QueryClientProvider>,
    )
    // The mode dropdown should be visible
    expect(screen.getByText('Single token')).toBeDefined()
  })
})
