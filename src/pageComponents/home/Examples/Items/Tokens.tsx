import { FC, useRef, useState } from 'react'
import styled from 'styled-components'

import { useVirtualizer } from '@tanstack/react-virtual'
import { Title } from 'db-ui-toolkit'
import { arbitrum, mainnet } from 'viem/chains'

import TokenLogo from '@/src/sharedComponents/TokenLogo'
import { useTokenSearch, useTokens } from '@/src/sharedComponents/TokensProvider'
import { type Tokens as TokensList } from '@/src/token'
import { getTruncatedHash } from '@/src/utils/strings'

const TokensList: FC<{ tokenList: TokensList }> = ({ tokenList }) => {
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
          height: `400px`,
          width: '300px',
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

export const TokensMainnet = () => {
  const { tokensByChainId } = useTokens()

  return (
    <div>
      <Title>Mainnet</Title>
      <TokensList tokenList={tokensByChainId[mainnet.id]} />
    </div>
  )
}

export const TokensArbitrum = () => {
  const { tokensByChainId } = useTokens()

  return (
    <div>
      <Title>Arbitrum</Title>
      <TokensList tokenList={tokensByChainId[arbitrum.id]} />
    </div>
  )
}

const Wrapper = styled.div`
  display: flex;
  direction: row;
  column-gap: 30px;
  outline: 1px solid #afafaf;
  padding: 10px;
`
const MultipleTokens = () => {
  return (
    <Wrapper>
      <TokensMainnet />
      <TokensArbitrum />
    </Wrapper>
  )
}

export default MultipleTokens
