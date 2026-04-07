import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import signMessage from './index'

const system = createSystem(defaultConfig)

vi.mock('@/src/wallet/hooks/useWeb3Status', () => ({
  useWeb3Status: vi.fn(() => ({
    isWalletConnected: false,
    isWalletSynced: false,
    walletChainId: undefined,
    appChainId: 11155420,
    switchChain: vi.fn(),
  })),
}))

vi.mock('@/src/wallet/providers', () => ({
  ConnectWalletButton: () => <button type="button">Connect Wallet</button>,
}))

describe('SignMessage demo', () => {
  it('renders connect wallet fallback when wallet not connected', () => {
    render(<ChakraProvider value={system}>{signMessage.demo}</ChakraProvider>)
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeDefined()
  })
})
