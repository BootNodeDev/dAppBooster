import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import type { Chain } from 'viem'
import { describe, expect, it, vi } from 'vitest'
import { ExplorerLink } from './ExplorerLink'

// Mock the getExplorerLink utility
vi.mock('@/src/utils/getExplorerLink', () => ({
  getExplorerLink: vi.fn(({ chain, hashOrAddress, explorerUrl }) => {
    if (explorerUrl) {
      return `${explorerUrl}/address/${hashOrAddress}`
    }
    return `https://example.com/${chain.id}/address/${hashOrAddress}`
  }),
}))

const system = createSystem(defaultConfig)

describe('ExplorerLink', () => {
  const mockChain = { id: 1, name: 'Ethereum' }
  const mockAddress = '0x1234567890abcdef1234567890abcdef12345678'

  it('renders with default text', () => {
    render(
      <ChakraProvider value={system}>
        <ExplorerLink
          chain={mockChain as Chain}
          hashOrAddress={mockAddress}
        />
      </ChakraProvider>,
    )

    const link = screen.getByText('View on explorer')
    expect(link).toBeDefined()
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe(`https://example.com/1/address/${mockAddress}`)
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('renders with custom text', () => {
    const customText = 'View transaction'

    render(
      <ChakraProvider value={system}>
        <ExplorerLink
          chain={mockChain as Chain}
          hashOrAddress={mockAddress}
          text={customText}
        />
      </ChakraProvider>,
    )

    const link = screen.getByText(customText)
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toBe(`https://example.com/1/address/${mockAddress}`)
  })

  it('passes additional props to the link', () => {
    render(
      <ChakraProvider value={system}>
        <ExplorerLink
          chain={mockChain as Chain}
          hashOrAddress={mockAddress}
          color="blue.500"
          fontWeight="bold"
        />
      </ChakraProvider>,
    )

    const link = screen.getByText('View on explorer')
    expect(link).toBeDefined()
  })

  it('works with explorerUrl parameter', () => {
    const mockExplorerUrl = 'https://custom-explorer.com'

    render(
      <ChakraProvider value={system}>
        <ExplorerLink
          chain={mockChain as Chain}
          explorerUrl={mockExplorerUrl}
          hashOrAddress={mockAddress}
        />
      </ChakraProvider>,
    )

    const link = screen.getByText('View on explorer')
    expect(link.getAttribute('href')).toBe(`${mockExplorerUrl}/address/${mockAddress}`)
  })
})
