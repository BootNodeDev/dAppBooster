import type { Token } from '@/src/types/token'
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TokenLogo from './TokenLogo'

const system = createSystem(defaultConfig)

const mockToken: Token = {
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  chainId: 1,
  decimals: 6,
  name: 'USD Coin',
  symbol: 'USDC',
  logoURI: 'https://example.com/usdc.png',
}

const tokenWithoutLogo: Token = {
  ...mockToken,
  logoURI: undefined,
}

function renderTokenLogo(token: Token, size?: number) {
  return render(
    <ChakraProvider value={system}>
      <TokenLogo
        token={token}
        size={size}
      />
    </ChakraProvider>,
  )
}

describe('TokenLogo', () => {
  it('renders an img with correct src when logoURI is present', () => {
    renderTokenLogo(mockToken)
    const img = screen.getByRole('img')
    expect(img).toBeDefined()
    expect(img.getAttribute('src')).toBe(mockToken.logoURI)
  })

  it('renders an img with correct alt text', () => {
    renderTokenLogo(mockToken)
    const img = screen.getByAltText('USD Coin')
    expect(img).toBeDefined()
  })

  it('applies correct width and height from size prop', () => {
    renderTokenLogo(mockToken, 48)
    const img = screen.getByRole('img')
    expect(img.getAttribute('width')).toBe('48')
    expect(img.getAttribute('height')).toBe('48')
  })

  it('renders placeholder with token symbol initial when no logoURI', () => {
    renderTokenLogo(tokenWithoutLogo)
    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.getByText('U')).toBeDefined() // first char of 'USDC'
  })

  it('renders placeholder when img fails to load', () => {
    renderTokenLogo(mockToken)
    const img = screen.getByRole('img')
    fireEvent.error(img)
    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.getByText('U')).toBeDefined()
  })

  it('converts ipfs:// URLs to https://ipfs.io gateway URLs', () => {
    const ipfsToken: Token = { ...mockToken, logoURI: 'ipfs://QmHash123' }
    renderTokenLogo(ipfsToken)
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toBe('https://ipfs.io/ipfs/QmHash123')
  })
})
