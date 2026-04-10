import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { NumericFormat } from 'react-number-format'
import { maxUint256, parseUnits } from 'viem'
import { describe, expect, it, vi } from 'vitest'
import { BigNumberInput } from './BigNumberInput'

const system = createSystem(defaultConfig)

function renderInput(
  props: Partial<ComponentProps<typeof BigNumberInput>> & {
    onChange?: (v: bigint) => void
  } = {},
) {
  const onChange = props.onChange ?? vi.fn()
  const { container } = render(
    <ChakraProvider value={system}>
      <BigNumberInput
        decimals={18}
        value={BigInt(0)}
        onChange={onChange}
        {...props}
      />
    </ChakraProvider>,
  )
  return { input: screen.getByRole('textbox') as HTMLInputElement, onChange, container }
}

describe('BigNumberInput', () => {
  it('renders without crashing', () => {
    const { input } = renderInput()
    expect(input).not.toBeNull()
    expect(input.tagName).toBe('INPUT')
  })

  it('renders with default placeholder', () => {
    const { input } = renderInput()
    expect(input.placeholder).toBe('0.00')
  })

  it('renders with custom placeholder', () => {
    const { input } = renderInput({ placeholder: 'Amount' })
    expect(input.placeholder).toBe('Amount')
  })

  it('renders as disabled when disabled prop is set', () => {
    const { input } = renderInput({ disabled: true })
    expect(input.disabled).toBe(true)
  })

  it('calls onChange with BigInt(0) when input is cleared after typing', async () => {
    const onChange = vi.fn()
    renderInput({ decimals: 0, onChange })
    const input = screen.getByRole('textbox')
    await userEvent.type(input, '5')
    await userEvent.clear(input)
    expect(onChange).toHaveBeenLastCalledWith(BigInt(0))
  })

  it('calls onChange with the parsed bigint when a valid value is typed', async () => {
    const onChange = vi.fn()
    renderInput({ decimals: 6, onChange })
    const input = screen.getByRole('textbox')
    await userEvent.type(input, '1.5')
    // 1.5 * 10^6 = 1500000
    expect(onChange).toHaveBeenLastCalledWith(BigInt(1_500_000))
  })

  it('calls onError when value exceeds max', async () => {
    const onChange = vi.fn()
    const onError = vi.fn()
    renderInput({
      decimals: 0,
      max: BigInt(100),
      onChange,
      onError,
    })
    const input = screen.getByRole('textbox')
    await userEvent.type(input, '200')
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ value: '200' }))
  })

  it('calls onError when value is below min', async () => {
    const onChange = vi.fn()
    const onError = vi.fn()
    renderInput({
      decimals: 0,
      min: BigInt(10),
      onChange,
      onError,
    })
    const input = screen.getByRole('textbox')
    await userEvent.type(input, '5')
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ value: '5' }))
  })

  it('does not call onError for valid values', async () => {
    const onError = vi.fn()
    renderInput({ decimals: 0, max: BigInt(100), onError })
    const input = screen.getByRole('textbox')
    await userEvent.type(input, '50')
    // onError is only called on invalid values; valid value should not trigger it
    expect(onError).not.toHaveBeenCalled()
  })

  it('ignores the extra digit when input has too many decimals', async () => {
    const onChange = vi.fn()
    renderInput({ decimals: 2, onChange })
    const input = screen.getByRole('textbox')
    await userEvent.type(input, '1.123')
    // '1.12' is valid (2 decimals), '1.123' has 3 and is ignored
    // Last valid call should be for 1.12 = 112n (2 decimals)
    const lastCall = onChange.mock.calls.at(-1)?.[0]
    expect(lastCall).toBe(BigInt(112))
  })

  it('does not call onError when value is within max constraint', async () => {
    const onError = vi.fn()
    renderInput({ decimals: 0, max: maxUint256, onError })
    // Large but valid number — well within maxUint256, so no error
    const input = screen.getByRole('textbox')
    await userEvent.type(input, '9999999')
    expect(onError).not.toHaveBeenCalled()
  })
})

describe('BigNumberInput with renderInput (NumericFormat)', () => {
  function renderWithNumericFormat(
    props: Partial<ComponentProps<typeof BigNumberInput>> & {
      onChange?: (v: bigint) => void
    } = {},
    initialValue = BigInt(0),
  ) {
    const onChange = props.onChange ?? vi.fn()

    const initialDecimals = props.decimals ?? 18

    const makeJsx = (value: bigint, decimals = initialDecimals) => (
      <ChakraProvider value={system}>
        <BigNumberInput
          decimals={decimals}
          value={value}
          onChange={onChange}
          renderInput={({
            onChange: handleChange,
            value: displayVal,
            inputRef: _inputRef,
            ...restProps
          }) => (
            <NumericFormat
              thousandSeparator
              onValueChange={({ value: v }) => handleChange(v)}
              value={displayVal as string | undefined}
              // biome-ignore lint/suspicious/noExplicitAny: mirrors TokenAmountField pattern
              {...(restProps as any)}
            />
          )}
          {...props}
        />
      </ChakraProvider>
    )

    const { container, rerender } = render(makeJsx(initialValue))

    return {
      input: container.querySelector('input') as HTMLInputElement,
      onChange,
      rerender: (newValue: bigint, decimals?: number) => rerender(makeJsx(newValue, decimals)),
    }
  }

  it('shows empty input (placeholder) when value is 0n', () => {
    const { input } = renderWithNumericFormat()
    expect(input.value).toBe('')
  })

  it('formats value with thousand separators when value changes externally', async () => {
    const { input, rerender } = renderWithNumericFormat()
    rerender(parseUnits('1000', 18))
    await waitFor(() => {
      expect(input.value).toBe('1,000')
    })
  })

  it('shows empty input after value resets to 0n', async () => {
    const { input, rerender } = renderWithNumericFormat()
    rerender(parseUnits('1000', 18))
    await waitFor(() => {
      expect(input.value).toBe('1,000')
    })
    rerender(BigInt(0))
    await waitFor(() => {
      expect(input.value).toBe('')
    })
  })

  it('preserves user-typed "0" without clearing to placeholder', async () => {
    const { input } = renderWithNumericFormat()
    await userEvent.type(input, '0')
    expect(input.value).toBe('0')
  })

  it('shows formatted initial value when mounted with non-zero value', () => {
    const { input } = renderWithNumericFormat({}, parseUnits('1000', 18))
    expect(input.value).toBe('1,000')
  })

  it('reformats value when decimals change (token switch)', async () => {
    const value = parseUnits('1000', 18)
    const { input, rerender } = renderWithNumericFormat({}, value)
    await waitFor(() => {
      expect(input.value).toBe('1,000')
    })
    // Same bigint but with 6 decimals produces a completely different display value
    rerender(value, 6)
    await waitFor(() => {
      expect(input.value).toBe('1,000,000,000,000,000')
    })
  })
})
