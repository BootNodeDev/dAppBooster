import React, { useState, ReactElement, HTMLProps, useEffect, useCallback } from 'react'

import { useDebouncedCallback } from 'use-debounce'
import { Chain } from 'viem'

import detectHash, { DetectedHash } from '@/src/utils/hash'

interface HashInputProps extends HTMLProps<HTMLInputElement> {
  chain: Chain
  onSearch: (result: DetectedHash | null) => void
  renderInput?: (props: HTMLProps<HTMLInputElement>) => ReactElement
  value?: string
  debounceTime?: number
}

/**
 * HashInput Component
 *
 * This component provides an input field where users can enter an address,
 * transaction hash, or ENS name. It detects the type of input and displays the relevant
 * information based on the detection results.
 *
 * @example
 * const chain = mainnet;
 * return <HashInput chain={chain} onSearch={(result) => console.log(result)} />;
 *
 * @param {Object} props - Component props
 * @param {Chain} props.chain - The chain to use for detection (use chains from viem)
 * @param {string} [props.value] - Optional value for controlled input
 * @param {number} [props.debounceTime=500] - Optional debounce time for search
 * @param {Function} [props.renderInput] - Optional render function for custom input component
 * @param {Function} [props.onSearch] - Callback function to handle search results
 */

const HashInput: React.FC<HashInputProps> = ({
  chain,
  debounceTime = 500,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <div>
      {renderInput ? (
        renderInput({ value: input, onChange: handleChange, ...restProps })
      ) : (
        <input
          {...restProps}
          onChange={handleChange}
          placeholder="Enter address, ENS name, or transaction hash"
          type="text"
          value={input}
        />
      )}
      {loading && <span>Loading...</span>}
    </div>
  )
}

export default HashInput
