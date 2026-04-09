import { chakra, type InputProps } from '@chakra-ui/react'
import {
  type ChangeEvent,
  type FC,
  type ReactElement,
  type RefObject,
  useEffect,
  useRef,
  useState,
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
  const [hasError, setHasError] = useState(false)
  const [displayValue, setDisplayValue] = useState('')
  const prevValueRef = useRef(value)
  const prevDecimalsRef = useRef(decimals)

  // Sync displayValue when an external change updates value or decimals (e.g. max click, token change).
  // Using render-time state update to avoid a visible flash between renders.
  if (prevValueRef.current !== value || prevDecimalsRef.current !== decimals) {
    prevValueRef.current = value
    prevDecimalsRef.current = decimals
    setDisplayValue(value === BigInt(0) ? '' : formatUnits(value, decimals))
  }

  // DOM sync for the native input path (no renderInput).
  // When renderInput is provided (e.g. NumericFormat), inputRef is not attached to the DOM
  // and this effect is a no-op. External value changes for that path are handled via
  // the displayValue state above.
  useEffect(() => {
    const current = inputRef.current
    if (!current) {
      return
    }
    // The input may contain an intermediate/unparseable string while the user is
    // typing; guard against a parseUnits throw so an external value update never
    // crashes the effect.
    let currentInputValue: bigint
    try {
      currentInputValue = parseUnits(current.value.replace(/,/g, '') || '0', decimals)
    } catch {
      currentInputValue = BigInt(-1) // sentinel: force the DOM value to be overwritten
    }

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
      prevValueRef.current = BigInt(0)
      setDisplayValue('')
      setHasError(false)
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

    const invalidValue =
      (min !== undefined && newValue < min) || (max !== undefined && newValue > max)

    if (invalidValue) {
      const _min = formatUnits(min, decimals)
      const _max = formatUnits(max, decimals)
      const message = `Invalid value! Range: [${_min}, ${
        max === maxUint256 ? 'maxUint256' : _max
      }] and value is: ${value}`
      console.warn(message)
      onError?.({ value, message })
      setHasError(true)
    } else {
      setHasError(false)
    }

    // Set prevValueRef before onChange so the render-time sync doesn't override the user's input.
    prevValueRef.current = newValue
    setDisplayValue(value)
    onChange(newValue)
  }

  const inputProps = {
    'aria-invalid': (hasError || undefined) as true | undefined,
    disabled,
    onChange: updateValue,
    placeholder,
    type: 'text',
  }

  return renderInput ? (
    renderInput({ ...inputProps, inputRef, value: displayValue })
  ) : (
    <chakra.input
      {...inputProps}
      ref={inputRef}
    />
  )
}
