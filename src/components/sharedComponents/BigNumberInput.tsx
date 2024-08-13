import {
  type ChangeEvent,
  type FC,
  type HTMLProps,
  type ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react'

import { formatUnits, parseUnits, maxUint256 } from 'viem'

export type RenderInputProps = Omit<HTMLProps<HTMLInputElement>, 'onChange'> & {
  onChange: (event: ChangeEvent<HTMLInputElement> | string) => void
}

export type BigNumberInputProps = {
  autofocus?: boolean
  decimals: number
  disabled?: boolean
  max?: string
  min?: string
  onChange: (value: string) => void
  onError?: (error: { value: string; message: string } | null) => void
  placeholder?: string
  renderInput?: (props: RenderInputProps) => ReactElement
  value: string
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
  max = maxUint256.toString(),
  min = '0',
  onChange,
  onError,
  placeholder = '0.00',
  renderInput,
  value,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const [inputValue, setInputvalue] = useState('')

  // update current value
  useEffect(() => {
    if (!value) {
      setInputvalue('')
      onError?.(null)
    } else {
      let parsedInputValue = 0n
      let parsedValue = 0n

      try {
        parsedInputValue = parseUnits(inputValue || '0', decimals)
        parsedValue = parseUnits(value || '0', decimals)
      } catch {
        // do nothing
      }

      if (parsedInputValue !== parsedValue) {
        setInputvalue(formatUnits(parsedValue, decimals))
        onError?.(null)
      }
    }
  }, [value, decimals, inputValue, onError])

  // autofocus
  useEffect(() => {
    if (!renderInput && autofocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autofocus, inputRef, renderInput])

  const updateValue = (event: ChangeEvent<HTMLInputElement> | string) => {
    const { value } = typeof event === 'string' ? { value: event } : event.currentTarget

    if (value === '') {
      onChange(value)
      setInputvalue(value)
      return
    }

    let newValue: bigint
    try {
      newValue = parseUnits(value, decimals)
    } catch (e) {
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
      (min && newValue < parseUnits(min, decimals)) || (max && newValue > parseUnits(max, decimals))

    if (invalidValue) {
      const message = `Invalid value! Range: [${min}, ${max === maxUint256.toString() ? 'maxUint256' : max}] and value is: ${value}`
      console.warn(message)
      onError?.({ value, message })
    }

    setInputvalue(value)
    onChange(value)
    !invalidValue && onError?.(null)
  }

  const inputProps = {
    disabled,
    onChange: updateValue,
    placeholder,
    type: 'text',
    value: inputValue,
  }

  return renderInput ? renderInput({ ...inputProps }) : <input {...inputProps} ref={inputRef} />
}