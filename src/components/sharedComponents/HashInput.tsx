import detectHash, { type DetectedHash } from '@/src/utils/hash'
import { type InputProps, chakra } from '@chakra-ui/react'
import {
  type ChangeEvent,
  type FC,
  type ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useDebouncedCallback } from 'use-debounce'
import type { Chain } from 'viem'

interface HashInputProps extends InputProps {
  chain: Chain
  debounceTime?: number
  onLoading?: (loading: boolean) => void
  onSearch: (result: DetectedHash | null) => void
  renderInput?: (props: InputProps) => ReactElement
  value?: string
}

/**
 * HashInput component for entering and detecting blockchain addresses, transaction hashes, or ENS names.
 *
 * This component provides an input field that processes user input to detect its type
 * (address, transaction hash, or ENS name) on a specified blockchain network.
 * It uses debounced search to prevent excessive requests and can be customized with a custom input renderer.
 *
 * @param {HashInputProps} props - The props for the HashInput component.
 * @param {Chain} props.chain - The blockchain network to use for detection (from viem chains).
 * @param {number} [props.debounceTime=500] - Delay in milliseconds before triggering search after input changes.
 * @param {(loading: boolean) => void} [props.onLoading] - Callback fired when loading state changes.
 * @param {(result: DetectedHash | null) => void} props.onSearch - Callback fired with detection results.
 * @param {(props: InputProps) => ReactElement} [props.renderInput] - Custom input renderer function.
 * @param {string} [props.value] - Controlled input value.
 * @param {InputProps} [props.restProps] - Additional props inherited from Chakra UI InputProps.
 *
 * @example
 * ```tsx
 * <HashInput
 *   chain={mainnet}
 *   onSearch={(result) => console.log(result)}
 *   debounceTime={300}
 *   placeholder="Enter address, ENS name or transaction hash"
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
}: HashInputProps) => {
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
        <chakra.input
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
