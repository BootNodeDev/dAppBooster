import { type InputProps, chakra } from '@chakra-ui/react'
import {
  type ChangeEvent,
  type FC,
  type ReactElement,
  type RefObject,
  useEffect,
  useRef,
} from 'react'
import { formatUnits, maxUint256, parseUnits } from 'viem'
export type RenderInputProps = Omit<InputProps, 'onChange'> & {
  onChange: (event: ChangeEvent<HTMLInputElement> | string) => void
  inputRef: RefObject<HTMLInputElement | null>
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
 * BigNumberInput component for handling bigint values with decimal precision.
 *
 * This component provides a way to input and validate numeric values with specific decimal places.
 * It handles conversion between string representation and bigint values.
 *
 * @param {BigNumberInputProps} props - The props for the BigNumberInput component.
 * @param {boolean} [props.autofocus=false] - Whether to focus the input automatically.
 * @param {number} props.decimals - The number of decimal places to use.
 * @param {boolean} [props.disabled=false] - Whether the input is disabled.
 * @param {bigint} [props.max=maxUint256] - Maximum allowed value.
 * @param {bigint} [props.min=0] - Minimum allowed value.
 * @param {(value: bigint) => void} props.onChange - Function called when the value changes.
 * @param {(error: { value: string; message: string } | null) => void} [props.onError] - Function called when there's an error.
 * @param {string} [props.placeholder='0.00'] - Placeholder text for the input.
 * @param {(props: RenderInputProps) => ReactElement} [props.renderInput] - Custom input renderer.
 * @param {bigint} props.value - The current value.
 *
 * @example
 * ```tsx
 * <BigNumberInput
 *   decimals={18}
 *   onChange={(value) => console.log(value)}
 *   value={BigInt(0)}
 * />
 * ```
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
}: BigNumberInputProps) => {
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
    <chakra.input
      {...inputProps}
      ref={inputRef}
    />
  )
}
