import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mainnet } from 'viem/chains'
import { describe, expect, it, vi } from 'vitest'
import HashInput from './HashInput'

const system = createSystem(defaultConfig)

const detectHashMock = vi.fn().mockResolvedValue({ type: 'EOA', data: '0xabc' })
vi.mock('@/src/utils/hash', () => ({
  default: (...args: unknown[]) => detectHashMock(...args),
}))

function renderHashInput(props: Partial<React.ComponentProps<typeof HashInput>> = {}) {
  const onSearch = props.onSearch ?? vi.fn()
  render(
    <ChakraProvider value={system}>
      <HashInput
        chain={mainnet}
        onSearch={onSearch}
        {...props}
      />
    </ChakraProvider>,
  )
  return { input: screen.getByTestId('hash-input') as HTMLInputElement, onSearch }
}

describe('HashInput', () => {
  it('renders without crashing', () => {
    const { input } = renderHashInput()
    expect(input).not.toBeNull()
    expect(input.tagName).toBe('INPUT')
  })

  it('renders with placeholder prop', () => {
    renderHashInput({ placeholder: 'Enter address or hash' })
    expect(screen.getByPlaceholderText('Enter address or hash')).toBeDefined()
  })

  it('reflects typed value in the input', async () => {
    const { input } = renderHashInput()
    await userEvent.type(input, 'test.eth')
    expect(input.value).toBe('test.eth')
  })

  it('renders with initial value', () => {
    renderHashInput({ value: '0xInitial' })
    const input = screen.getByTestId('hash-input') as HTMLInputElement
    expect(input.value).toBe('0xInitial')
  })

  it('calls onSearch with null when input is cleared', async () => {
    const onSearch = vi.fn()
    const { input } = renderHashInput({ onSearch })
    await userEvent.type(input, 'abc')
    await userEvent.clear(input)
    await waitFor(() => {
      expect(onSearch).toHaveBeenLastCalledWith(null)
    })
  })

  it('calls onSearch with detection result after debounce', async () => {
    const onSearch = vi.fn()
    detectHashMock.mockResolvedValueOnce({ type: 'ENS', data: '0x123' })
    renderHashInput({ onSearch, debounceTime: 0 })
    const input = screen.getByTestId('hash-input')
    await userEvent.type(input, 'vitalik.eth')
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith({ type: 'ENS', data: '0x123' })
    })
  })

  it('calls onLoading(true) then onLoading(false) during search', async () => {
    const onLoading = vi.fn()
    let resolveDetect!: (v: unknown) => void
    detectHashMock.mockImplementationOnce(
      () =>
        new Promise((res) => {
          resolveDetect = res
        }),
    )
    renderHashInput({ onLoading, debounceTime: 0 })
    const input = screen.getByTestId('hash-input')
    await userEvent.type(input, 'q')
    await waitFor(() => expect(onLoading).toHaveBeenCalledWith(true))
    resolveDetect({ type: null, data: null })
    await waitFor(() => expect(onLoading).toHaveBeenCalledWith(false))
  })

  it('uses custom renderInput when provided', () => {
    render(
      <ChakraProvider value={system}>
        <HashInput
          chain={mainnet}
          onSearch={vi.fn()}
          renderInput={(props) => (
            <input
              data-testid="custom-input"
              // biome-ignore lint/suspicious/noExplicitAny: Chakra InputProps incompatible with native input attrs
              {...(props as any)}
            />
          )}
        />
      </ChakraProvider>,
    )
    expect(screen.getByTestId('custom-input')).toBeDefined()
  })
})
