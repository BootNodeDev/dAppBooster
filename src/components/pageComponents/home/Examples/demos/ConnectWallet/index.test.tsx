import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import connectWallet from './index'

const system = createSystem(defaultConfig)

vi.mock('@/src/wallet/providers', () => ({
  ConnectWalletButton: () => <button type="button">Connect Wallet</button>,
}))

describe('ConnectWallet demo', () => {
  it('renders the connect wallet button', () => {
    render(<ChakraProvider value={system}>{connectWallet.demo}</ChakraProvider>)
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeDefined()
  })
})
