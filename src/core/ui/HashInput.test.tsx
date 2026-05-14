import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import type { PublicClient } from 'viem'
import { describe, expect, it, vi } from 'vitest'
import HashInput from './HashInput'

const system = createSystem(defaultConfig)

vi.mock('@/src/core/utils/hash', () => ({
  default: vi.fn().mockResolvedValue(null),
}))

// detectHash is module-mocked, so HashInput never actually calls into the
// PublicClient. A type-only stub keeps the component's contract honest.
const stubPublicClient = {} as unknown as PublicClient

describe('HashInput', () => {
  it('renders without crashing', () => {
    render(
      <ChakraProvider value={system}>
        <HashInput
          publicClient={stubPublicClient}
          onSearch={() => {}}
        />
      </ChakraProvider>,
    )

    const input = screen.getByTestId('hash-input')
    expect(input).not.toBeNull()
    expect(input.tagName).toBe('INPUT')
  })
})
