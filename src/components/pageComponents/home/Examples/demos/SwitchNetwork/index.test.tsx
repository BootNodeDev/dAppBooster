import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import switchNetwork from './index'

const system = createSystem(defaultConfig)

vi.mock('@/src/sdk/react/hooks', () => ({
  useWallet: vi.fn(() => ({
    status: { connected: false, activeAccount: null, connectedChainIds: [], connecting: false },
  })),
}))

vi.mock('@/src/wallet/providers', () => ({
  ConnectWalletButton: () => <button type="button">Connect Wallet</button>,
}))

describe('SwitchNetwork demo', () => {
  it('renders connect wallet button when wallet not connected', () => {
    render(<ChakraProvider value={system}>{switchNetwork.demo}</ChakraProvider>)
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeDefined()
  })
})
