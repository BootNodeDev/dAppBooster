import React, { type HTMLAttributes, type ReactElement } from 'react'
import styled from 'styled-components'

import { Card } from 'db-ui-toolkit'
import { mainnet } from 'viem/chains'

import { useTokenSearch } from '@/src/hooks/useTokenSearch'
import { useTokens } from '@/src/hooks/useTokens'
import List from '@/src/sharedComponents/TokenSelect/List'
import Search from '@/src/sharedComponents/TokenSelect/Search'
import TopTokens from '@/src/sharedComponents/TokenSelect/TopTokens'
import { type Token } from '@/src/types/token'

export type NetworksList = Array<{
  label: string
  onClick: () => void
  id: number
  icon: ReactElement
}>

const Wrapper = styled(Card)`
  padding: calc(var(--base-common-padding) * 5) 0 calc(var(--base-common-padding) * 3);
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--base-gap) * 3);
  width: 540px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  containerHeight?: number
  currentNetworkId?: number
  iconSize?: number
  itemHeight?: number
  networksList?: NetworksList
  onTokenSelect: (token: Token | undefined) => void
  placeholder?: string
  showTopTokens?: boolean
  showBalance?: boolean
  showValue?: boolean
}

const TokenSelect: React.FC<Props> = ({
  containerHeight = 320,
  currentNetworkId = mainnet.id,
  iconSize = 32,
  itemHeight = 64,
  networksList,
  onTokenSelect,
  placeholder = 'Search by name or address',
  showBalance = false,
  showTopTokens = false,
  showValue = false,
  ...restProps
}) => {
  const { tokensByChainId } = useTokens()
  const { searchResult, searchTerm, setSearchTerm } = useTokenSearch(
    tokensByChainId[currentNetworkId],
  )

  return (
    <Wrapper {...restProps}>
      <Search
        currentNetworkId={currentNetworkId}
        networksList={networksList}
        placeholder={placeholder}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      {showTopTokens && (
        <TopTokens onTokenSelect={onTokenSelect} tokens={tokensByChainId[currentNetworkId]} />
      )}
      <List
        containerHeight={containerHeight}
        iconSize={iconSize}
        itemHeight={itemHeight}
        onTokenSelect={onTokenSelect}
        showBalance={showBalance}
        showValue={showValue}
        tokenList={searchResult}
      />
    </Wrapper>
  )
}

export default TokenSelect
