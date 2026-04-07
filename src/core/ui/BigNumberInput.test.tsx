import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BigNumberInput } from './BigNumberInput'

const system = createSystem(defaultConfig)

describe('BigNumberInput', () => {
  it('renders without crashing', () => {
    render(
      <ChakraProvider value={system}>
        <BigNumberInput
          decimals={18}
          value={BigInt(0)}
          onChange={() => {}}
        />
      </ChakraProvider>,
    )

    const input = screen.getByRole('textbox')
    expect(input).not.toBeNull()
    expect(input.tagName).toBe('INPUT')
  })
})
