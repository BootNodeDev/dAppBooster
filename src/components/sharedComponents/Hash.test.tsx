import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Hash from './Hash'

// Mock the dependencies
vi.mock('@/src/components/sharedComponents/ui/CopyButton', () => ({
  default: vi.fn(({ onClick, value }) => (
    <button
      data-testid="copy-button"
      onClick={onClick}
      data-value={value}
      type="button"
    >
      Copy
    </button>
  )),
}))

vi.mock('@/src/components/sharedComponents/ui/ExternalLink', () => ({
  default: vi.fn(({ href }) => (
    <a
      data-testid="external-link"
      href={href}
    >
      External
    </a>
  )),
}))

vi.mock('@/src/utils/strings', () => ({
  getTruncatedHash: vi.fn((hash, length) => {
    if (length === 0) return hash
    return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`
  }),
}))

const system = createSystem(defaultConfig)

describe('Hash', () => {
  const mockHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'

  it('renders truncated hash with default settings', () => {
    render(
      <ChakraProvider value={system}>
        <Hash hash={mockHash} />
      </ChakraProvider>,
    )

    // Default truncated length is 6
    expect(screen.getByText('0x1234...abcdef')).toBeDefined()
  })

  it('renders full hash when truncation is disabled', () => {
    render(
      <ChakraProvider value={system}>
        <Hash
          hash={mockHash}
          truncatedHashLength="disabled"
        />
      </ChakraProvider>,
    )

    expect(screen.getByText(mockHash)).toBeDefined()
  })

  it('renders with copy button when showCopyButton is true', () => {
    render(
      <ChakraProvider value={system}>
        <Hash
          hash={mockHash}
          showCopyButton
        />
      </ChakraProvider>,
    )

    const copyButton = screen.getByTestId('copy-button')
    expect(copyButton).toBeDefined()
    expect(copyButton.getAttribute('data-value')).toBe(mockHash)
  })

  it('renders with external link when explorerURL is provided', () => {
    const explorerURL = 'https://example.com/tx/123'

    render(
      <ChakraProvider value={system}>
        <Hash
          hash={mockHash}
          explorerURL={explorerURL}
        />
      </ChakraProvider>,
    )

    const externalLink = screen.getByTestId('external-link')
    expect(externalLink).toBeDefined()
    expect(externalLink.getAttribute('href')).toBe(explorerURL)
  })

  it('renders with custom truncated length', () => {
    render(
      <ChakraProvider value={system}>
        <Hash
          hash={mockHash}
          truncatedHashLength={4}
        />
      </ChakraProvider>,
    )

    // Custom truncated length of 4
    expect(screen.getByText('0x12...cdef')).toBeDefined()
  })
})
