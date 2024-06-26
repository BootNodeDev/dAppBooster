import { FC, useRef, useState } from 'react'

import { useVirtualizer } from '@tanstack/react-virtual'

import { useTokenSearch } from '@/src/hooks/useTokenSearch'
import TokenLogo from '@/src/sharedComponents/TokenLogo'
import { type Tokens } from '@/src/token'
import { getTruncatedHash } from '@/src/utils/strings'

const TokensList: FC<{ tokenList: Tokens }> = ({ tokenList }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const searchResult = useTokenSearch({ searchTerm, tokens: tokenList })

  const parentRef = useRef(null)

  const rowVirtualizer = useVirtualizer({
    count: searchResult.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 30,
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
          marginTop: '10px',
          height: `200px`,
          overflowY: 'auto',
          overflowX: 'hidden',
          outline: '1px solid #efefef',
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
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
                display: 'flex',
                columnGap: '10px',
                width: '100vw',
              }}
            >
              <TokenLogo token={searchResult[virtualItem.index]} />
              {searchResult[virtualItem.index].symbol}
              {' - '}
              {getTruncatedHash(searchResult[virtualItem.index].address)}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default TokensList
