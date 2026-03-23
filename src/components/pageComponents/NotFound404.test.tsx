import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import NotFound404 from './NotFound404'

const system = createSystem(defaultConfig)

vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(() => vi.fn()),
}))

describe('NotFound404', () => {
  it('renders 404 title and message', () => {
    render(
      <ChakraProvider value={system}>
        <NotFound404 />
      </ChakraProvider>,
    )
    expect(screen.getByText('404 - Not Found')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Home' })).toBeDefined()
  })
})
