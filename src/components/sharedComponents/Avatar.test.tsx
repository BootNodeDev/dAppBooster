import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Avatar from './Avatar'

// Mock Jazzicon component
vi.mock('react-jazzicon', () => ({
  default: vi.fn(({ diameter, seed }) => (
    <div
      data-testid="avatar-icon"
      data-diameter={diameter}
      data-seed={seed}
    >
      Mocked Jazzicon
    </div>
  )),
  jsNumberForAddress: vi.fn().mockReturnValue(12345),
}))

const system = createSystem(defaultConfig)

describe('Avatar', () => {
  const mockAddress = '0x1234567890abcdef1234567890abcdef12345678'

  it('renders Jazzicon when no ENS image is provided', () => {
    render(
      <ChakraProvider value={system}>
        <Avatar
          address={mockAddress}
          ensImage={null}
          ensName={null}
          size={100}
        />
      </ChakraProvider>,
    )

    const jazzicon = screen.getByTestId('avatar-icon')
    expect(jazzicon).toBeDefined()
    expect(jazzicon.getAttribute('data-diameter')).toBe('100')
  })

  it('renders ENS image when provided', () => {
    const ensImage = 'https://example.com/avatar.png'
    const ensName = 'test.eth'

    render(
      <ChakraProvider value={system}>
        <Avatar
          address={mockAddress}
          ensImage={ensImage}
          ensName={ensName}
          size={100}
        />
      </ChakraProvider>,
    )

    const image = screen.getByAltText(ensName)
    expect(image).toBeDefined()
    expect(image.getAttribute('src')).toBe(ensImage)
  })

  it('uses address as alt text when ENS name is not provided', () => {
    const ensImage = 'https://example.com/avatar.png'

    render(
      <ChakraProvider value={system}>
        <Avatar
          address={mockAddress}
          ensImage={ensImage}
          ensName={null}
          size={100}
        />
      </ChakraProvider>,
    )

    const image = screen.getByAltText(mockAddress)
    expect(image).toBeDefined()
  })

  it('renders with default size when size is not provided', () => {
    render(
      <ChakraProvider value={system}>
        <Avatar
          address={mockAddress}
          ensImage={null}
          ensName={null}
        />
      </ChakraProvider>,
    )

    const jazzicon = screen.getByTestId('avatar-icon')
    expect(jazzicon.getAttribute('data-diameter')).toBe('100')
  })
})
