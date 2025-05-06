import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { mainnet } from 'viem/chains'
import { describe, expect, it, vi } from 'vitest'
import HashInput from './HashInput'

const system = createSystem(defaultConfig)

vi.mock('@/src/utils/hash', () => ({
  default: vi.fn().mockResolvedValue(null),
}))

describe('HashInput', () => {
  it('renders without crashing', () => {
    render(
      <ChakraProvider value={system}>
        <HashInput
          chain={mainnet}
          onSearch={() => {}}
        />
      </ChakraProvider>,
    )

    const input = screen.getByTestId('hash-input')
    expect(input).not.toBeNull()
    expect(input.tagName).toBe('INPUT')
  })
})
