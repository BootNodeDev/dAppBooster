import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import hashHandling from './index'

const system = createSystem(defaultConfig)

vi.mock('@/src/hooks/useWeb3Status', () => ({
  useWeb3Status: vi.fn(() => ({
    isWalletConnected: false,
    walletChainId: undefined,
  })),
}))

vi.mock('@/src/utils/hash', () => ({
  detectHash: vi.fn(() => Promise.resolve(null)),
}))

describe('HashHandling demo', () => {
  it('renders the hash input field', () => {
    render(<ChakraProvider value={system}>{hashHandling.demo}</ChakraProvider>)
    expect(screen.getByPlaceholderText(/address|hash/i)).toBeDefined()
  })
})
