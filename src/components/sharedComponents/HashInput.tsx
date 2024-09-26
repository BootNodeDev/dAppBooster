import {
  type ChangeEvent,
  type ComponentProps,
  type FC,
  type ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react'

import { useDebouncedCallback } from 'use-debounce'
import type { Chain } from 'viem'

import detectHash, { type DetectedHash } from '@/src/utils/hash'

interface HashInputProps extends ComponentProps<'input'> {
  chain: Chain
  debounceTime?: number
  onLoading?: (loading: boolean) => void
  onSearch: (result: DetectedHash | null) => void
  renderInput?: (props: ComponentProps<'input'>) => ReactElement
  value?: string
}

/**
 * HashInput Component
 *
 * This component provides an input field where users can enter an address,
 * transaction hash, or ENS name. It detects the type of input and displays the relevant
 * information based on the detection results.
 *
 * @param {Object} props - Component props
 * @param {Chain} props.chain - The chain to use for detection (use chains from viem)
 * @param {string} [props.value] - Optional value for controlled input
 * @param {number} [props.debounceTime=500] - Optional debounce time for search
 * @param {Function} [props.renderInput] - Optional render function for custom input component
 * @param {Function} [props.onSearch] - Callback function to handle search results
 *
 * @example
 * ```tsx
 * <HashInput
 *    chain={mainnet}
 *    onSearch={(result) => console.log(result)}
 * />
 * ```
 */

const HashInput: FC<HashInputProps> = ({
  chain,
  debounceTime = 500,
  onLoading,
  onSearch,
  renderInput,
  value,
  ...restProps
}) => {
  const [input, setInput] = useState(value || '')
  const [loading, setLoading] = useState<boolean>(false)

  const handleSearch = useCallback(
    async (value: string) => {
      if (value) {
        setLoading(true)
        const detected = await detectHash({ chain, hashOrString: value })
        setLoading(false)
        onSearch(detected)
      } else {
        onSearch(null)
      }
    },
    [chain, onSearch],
  )

  const debouncedHandleChange = useDebouncedCallback(handleSearch, debounceTime)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)
    debouncedHandleChange(value)
  }

  useEffect(() => {
    if (value !== undefined) {
      setInput(value)
      debouncedHandleChange(value)
    }
  }, [value, debouncedHandleChange])

  useEffect(() => {
    onLoading?.(loading)
  }, [loading, onLoading])

  return (
    <>
      {renderInput ? (
        renderInput({ value: input, onChange: handleChange, ...restProps })
      ) : (
        <input
          data-testid="hash-input"
          onChange={handleChange}
          type="search"
          value={input}
          {...restProps}
        />
      )}
    </>
  )
}

export default HashInput
