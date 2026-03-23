import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Home } from './index'

const system = createSystem(defaultConfig)

// Mock sub-components that pull in Web3 dependencies to keep this a pure structural test
vi.mock('@/src/components/pageComponents/home/Examples', () => ({
  default: () => <section data-testid="examples">Examples</section>,
}))

vi.mock('@/src/components/pageComponents/home/Welcome', () => ({
  default: () => <section data-testid="welcome">Welcome</section>,
}))

describe('Home', () => {
  it('renders Welcome and Examples sections', () => {
    render(
      <ChakraProvider value={system}>
        <Home />
      </ChakraProvider>,
    )
    expect(screen.getByTestId('welcome')).toBeDefined()
    expect(screen.getByTestId('examples')).toBeDefined()
  })
})
