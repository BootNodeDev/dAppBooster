import { useRef, useState } from 'react'

import { useVirtualizer } from '@tanstack/react-virtual'
import { mainnet } from 'wagmi/chains'

import { useTokenSearch, useTokens } from '@/src/sharedComponents/TokensProvider'

const Tokens = () => {
  const { tokensByChainId } = useTokens()
  const [searchTerm, setSearchTerm] = useState('')
  const searchResult = useTokenSearch({ searchTerm, tokens: tokensByChainId[mainnet.id] })

  const parentRef = useRef(null)

  const rowVirtualizer = useVirtualizer({
    count: searchResult.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 5,
  })

  // example adapted from: https://tanstack.com/virtual/latest/docs/introduction
  return (
    <>
      <input onChange={(e) => setSearchTerm(e.target.value)} placeholder="search..." type="text" />
      {/* The scrollable element for your list */}
      <div
        ref={parentRef}
        style={{
          height: `400px`,
          width: '80%',
          overflow: 'auto',
          outline: '1px solid red',
        }}
      >
        {/* The large inner element to hold all of the items */}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {/* Only the visible items in the virtualizer, manually positioned to be in view */}
          {rowVirtualizer.getVirtualItems().map((virtualItem) => (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {searchResult[virtualItem.index].address} - {searchResult[virtualItem.index].symbol} (
              {searchResult[virtualItem.index].chainId})
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Tokens
