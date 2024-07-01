import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { Card } from 'db-ui-toolkit'
import { arbitrum, mainnet, polygon } from 'viem/chains'

import { useTokenSearch } from '@/src/hooks/useTokenSearch'
import { useTokens } from '@/src/hooks/useTokens'
import List from '@/src/pageComponents/home/Examples/demos/TokenSelect/List'
import Search from '@/src/pageComponents/home/Examples/demos/TokenSelect/Search'

const Wrapper = styled(Card)`
  padding-bottom: calc(var(--base-common-padding) * 3);
  padding-top: calc(var(--base-common-padding) * 5);
  width: 540px;
`

const TokenSelect: React.FC<HTMLAttributes<HTMLDivElement>> = ({ ...restProps }) => {
  const { tokensByChainId } = useTokens()
  const { searchResult, searchTerm, setSearchTerm } = useTokenSearch(tokensByChainId[mainnet.id])

  return (
    <Wrapper {...restProps}>
      <Search
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by name or address"
        value={searchTerm}
      />
      <List tokenList={searchResult} />
    </Wrapper>
  )
}

export default TokenSelect
