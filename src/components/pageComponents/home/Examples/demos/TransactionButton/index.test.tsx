import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import transactionButton from './index'

const system = createSystem(defaultConfig)

vi.mock('@/src/hooks/useWeb3Status', () => ({
  useWeb3Status: vi.fn(() => ({
    isWalletConnected: false,
    isWalletSynced: false,
    walletChainId: undefined,
    appChainId: 11155420,
    switchChain: vi.fn(),
  })),
}))

vi.mock('@/src/providers/Web3Provider', () => ({
  ConnectWalletButton: () => <button type="button">Connect Wallet</button>,
}))

describe('TransactionButton demo', () => {
  it('renders connect wallet fallback when wallet not connected', () => {
    render(<ChakraProvider value={system}>{transactionButton.demo}</ChakraProvider>)
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeDefined()
  })
})
