import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import hashHandling from './index'

const system = createSystem(defaultConfig)

vi.mock('@/src/sdk/react/hooks', () => ({
  useWallet: vi.fn(() => ({
    status: { connected: false, activeAccount: null, connectedChainIds: [], connecting: false },
  })),
}))

vi.mock('@/src/core/utils/hash', () => {
  const mockFn = vi.fn(() => Promise.resolve(null))
  return {
    default: mockFn,
    detectHash: mockFn,
  }
})

describe('HashHandling demo', () => {
  it('renders the hash input field', () => {
    render(<ChakraProvider value={system}>{hashHandling.demo}</ChakraProvider>)
    expect(screen.getByPlaceholderText(/address|hash/i)).toBeDefined()
  })
})
