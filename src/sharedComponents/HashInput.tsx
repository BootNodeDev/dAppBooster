import React, { useState, ReactElement, HTMLProps, useEffect, useCallback } from 'react'

import { Chain } from 'viem'

import detectHash, { DetectedHash } from '@/src/utils/hash'

interface HashInputProps extends HTMLProps<HTMLInputElement> {
  chain: Chain
  onSearch: (result: DetectedHash | null) => void
  renderInput?: (props: HTMLProps<HTMLInputElement>) => ReactElement
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
 * @param {Function} [props.renderInput] - Optional render function for custom input component
 * @param {Function} [props.onSearch] - Callback function to handle search results
 */

const HashInput: React.FC<HashInputProps> = ({
  chain,
  onSearch,
  renderInput,
  value,
  ...restProps
}) => {
  const [input, setInput] = useState(value || '')

  const [loading, setLoading] = useState<boolean>(false)

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value

      setInput(value)

      if (value) {
        setLoading(true)
        const detected = await detectHash({ chain, hashOrString: value })
        setLoading(false)
        onSearch(detected)
      } else {
        if (onSearch) {
          onSearch(null)
        }
      }
    },
    [chain, onSearch],
  )

  useEffect(() => {
    if (value !== undefined) {
      // Update input value when the value prop changes
      handleChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>)
    }
  }, [handleChange, value])

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
