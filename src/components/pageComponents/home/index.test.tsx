import { renderWithProviders } from '@/src/test-utils'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Home } from './index'

// Mock sub-components that pull in Web3 dependencies to keep this a pure structural test
vi.mock('@/src/components/pageComponents/home/Examples', () => ({
  default: () => <section data-testid="examples">Examples</section>,
}))

vi.mock('@/src/components/pageComponents/home/Welcome', () => ({
  default: () => <section data-testid="welcome">Welcome</section>,
}))

describe('Home', () => {
  it('renders Welcome and Examples sections', () => {
    renderWithProviders(<Home />)
    expect(screen.getByTestId('welcome')).toBeDefined()
    expect(screen.getByTestId('examples')).toBeDefined()
  })
})
