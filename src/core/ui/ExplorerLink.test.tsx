import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ExplorerLink } from './ExplorerLink'

// Mock useChainRegistry so the component does not require a DAppBoosterProvider.
vi.mock('@/src/sdk/react/hooks', () => ({
  useChainRegistry: () => ({ id: 'mock-registry' }),
}))

// Mock getExplorerUrl so the test owns the URL it asserts against.
vi.mock('@/src/sdk/core/chain/explorer', () => ({
  getExplorerUrl: vi.fn((_registry, params) => {
    if ('tx' in params) {
      return `https://example.com/${params.chainId}/tx/${params.tx}`
    }
    if ('address' in params) {
      return `https://example.com/${params.chainId}/address/${params.address}`
    }
    return `https://example.com/${params.chainId}/block/${params.block}`
  }),
}))

const system = createSystem(defaultConfig)
const mockAddress = '0x1234567890abcdef1234567890abcdef12345678'
const mockTx = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'

describe('ExplorerLink', () => {
  it('renders an address link with default text', () => {
    render(
      <ChakraProvider value={system}>
        <ExplorerLink
          address={mockAddress}
          chainId={1}
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

  it('renders a transaction link with custom text', () => {
    const customText = 'View transaction'

    render(
      <ChakraProvider value={system}>
        <ExplorerLink
          chainId={1}
          text={customText}
          tx={mockTx}
        />
      </ChakraProvider>,
    )

    const link = screen.getByText(customText)
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toBe(`https://example.com/1/tx/${mockTx}`)
  })

  it('renders a block link', () => {
    render(
      <ChakraProvider value={system}>
        <ExplorerLink
          block={123456}
          chainId={1}
        />
      </ChakraProvider>,
    )

    const link = screen.getByText('View on explorer')
    expect(link.getAttribute('href')).toBe('https://example.com/1/block/123456')
  })

  it('passes additional link props through', () => {
    render(
      <ChakraProvider value={system}>
        <ExplorerLink
          address={mockAddress}
          chainId={1}
          color="blue.500"
          fontWeight="bold"
        />
      </ChakraProvider>,
    )

    const link = screen.getByText('View on explorer')
    expect(link).toBeDefined()
  })
})
