import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ensName from './index'

const system = createSystem(defaultConfig)

vi.mock('wagmi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('wagmi')>()),
  useEnsName: vi.fn(() => ({ data: undefined, error: undefined, status: 'pending' })),
}))

describe('EnsName demo', () => {
  it('renders the ENS name search interface', () => {
    render(<ChakraProvider value={system}>{ensName.demo}</ChakraProvider>)
    expect(screen.getByText('Find ENS name')).toBeDefined()
    expect(
      screen.getByPlaceholderText('Enter an address or select one from the dropdown'),
    ).toBeDefined()
  })
})
