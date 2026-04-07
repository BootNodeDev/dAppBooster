import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import tokenDropdown from './index'

const system = createSystem(defaultConfig)

// Mock the shared component to avoid its deep dependency chain
// (TokenSelect uses withSuspenseAndRetry, useTokenLists, useTokens, etc.)
vi.mock('@/src/tokens/components', () => ({
  TokenDropdown: () => <div data-testid="token-dropdown-mock">Token Dropdown</div>,
}))

describe('TokenDropdown demo', () => {
  it('renders the token dropdown container', () => {
    render(<ChakraProvider value={system}>{tokenDropdown.demo}</ChakraProvider>)
    expect(screen.getByText('Search and select a token')).toBeDefined()
    expect(screen.getByTestId('token-dropdown-mock')).toBeDefined()
  })
})
