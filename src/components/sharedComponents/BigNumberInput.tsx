import {
  type ChangeEvent,
  type ComponentProps,
  type FC,
  type ReactElement,
  type RefObject,
  useEffect,
  useRef,
} from 'react'

import { formatUnits, maxUint256, parseUnits } from 'viem'

export type RenderInputProps = Omit<ComponentProps<'input'>, 'onChange'> & {
  onChange: (event: ChangeEvent<HTMLInputElement> | string) => void
  inputRef: RefObject<HTMLInputElement>
}

export type BigNumberInputProps = {
  autofocus?: boolean
  decimals: number
  disabled?: boolean
  max?: bigint
  min?: bigint
  onChange: (value: bigint) => void
  onError?: (error: { value: string; message: string } | null) => void
  placeholder?: string
  renderInput?: (props: RenderInputProps) => ReactElement
  value: bigint
}

/**
 * Renders a component for inputting a big number value.
 *
 * @example
 * ```tsx
 * <BigNumberInput
 *   decimals={token.decimals}
 *   onChange={(newValue) => setValue(newValue)}
 *   value={value}
 * />
 * ```
 *
 * @category Component
 *
 */
export const BigNumberInput: FC<BigNumberInputProps> = ({
  autofocus,
  decimals,
  disabled,
  max = maxUint256,
  min = BigInt(0),
  onChange,
  onError,
  placeholder = '0.00',
  renderInput,
  value,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  // update inputValue when value changes
  useEffect(() => {
    const current = inputRef.current
    if (!current) {
      return
    }
    const currentInputValue = parseUnits(current.value.replace(/,/g, '') || '0', decimals)

    if (currentInputValue !== value) {
      current.value = formatUnits(value, decimals)
    }
  }, [decimals, value])

  // autofocus
  useEffect(() => {
    if (!renderInput && autofocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [renderInput, autofocus])

  const updateValue = (event: ChangeEvent<HTMLInputElement> | string) => {
    const { value } = typeof event === 'string' ? { value: event } : event.currentTarget

    onError?.(null)

    if (value === '') {
      onChange(BigInt(0))
      return
    }

    let newValue: bigint
    try {
      newValue = parseUnits(value, decimals)
    } catch (e) {
      console.error(e)
      // don't update the input on invalid values
      return
    }

    // this will fail when a value has no decimals, which is quite common
    try {
      const [, valueDecimals] = value.split('.')

      if (valueDecimals.length > decimals) {
        return
      }
    } catch {
      // fall-through
    }

    const invalidValue = (min && newValue < min) || (max && newValue > max)

    if (invalidValue) {
      const _min = formatUnits(min, decimals)
      const _max = formatUnits(max, decimals)
      const message = `Invalid value! Range: [${_min}, ${
        max === maxUint256 ? 'maxUint256' : _max
      }] and value is: ${value}`
      console.warn(message)
      onError?.({ value, message })
    }

    onChange(newValue)
  }

  const inputProps = {
    disabled,
    onChange: updateValue,
    placeholder,
    type: 'text',
  }

  return renderInput ? (
    renderInput({ ...inputProps, inputRef })
  ) : (
    <input
      {...inputProps}
      ref={inputRef}
    />
  )
}
