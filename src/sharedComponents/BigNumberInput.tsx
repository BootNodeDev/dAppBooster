import { ChangeEvent, FC, HTMLProps, ReactElement, useEffect, useRef, useState } from 'react'

import { formatUnits, parseUnits, maxUint256 } from 'viem'

export type BigNumberInputProps = {
  autofocus?: boolean
  decimals: number
  disabled?: boolean
  max?: string
  min?: string
  onChange: (value: string) => void
  onError?: (error: { value: string; message: string } | null) => void
  placeholder?: string
  renderInput?: (props: HTMLProps<HTMLInputElement>) => ReactElement
  value: string
}

/**
 * @name BigNumberInput
 * @description Renders a component for inputting a big number value.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} [props.autofocus] - Determines whether the input should be automatically focused.
 * @param {number} [props.decimals] - The number of decimal places for the input value.
 * @param {boolean} [props.disabled] - Determines whether the input should be disabled.
 * @param {string} [props.max] - The maximum value allowed for the input.
 * @param {string} [props.min] - The minimum value allowed for the input.
 * @param {Function} props.onChange - The callback function called when the input value changes.
 * @param {Function} [props.onError] - The callback function called when an error occurs.
 * @param {string} [props.placeholder] - The placeholder text for the input.
 * @param {Function} [props.renderInput] - A custom render function for the input element.
 * @param {string} props.value - The current value of the input.
 * @returns {JSX.Element} - The rendered input component.
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

  const updateValue = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget

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
