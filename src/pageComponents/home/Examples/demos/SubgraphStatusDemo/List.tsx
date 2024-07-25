import { FC } from 'react'
import styled from 'styled-components'

import { arbitrum, base, type Chain, optimism, polygon } from 'viem/chains'

import { useSubgraphIndexingStatus } from '@/src/hooks/useSubgraphIndexingStatus'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'

const Wrapper = styled.div`
  [data-theme='light'] & {
    --theme-subgraph-data-row-color: #2e3048;
    --theme-subgraph-data-color: #5f6178;
  }

  [data-theme='dark'] & {
    --theme-subgraph-data-row-color: #fff;
    --theme-subgraph-data-color: #e2e0e7;
  }

  display: flex;
  flex-direction: column;
  padding: var(--base-common-padding-xl);
  row-gap: calc(var(--base-gap-xl) * 2);
`

const Row = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: var(--base-gap-xl);
`

const Title = styled.h3`
  color: var(--theme-subgraph-title-color);
  column-gap: var(--base-gap);
  display: flex;
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
`

const Data = styled.div<{ status: 'error' | 'ok' }>`
  --base-status-size: 10px;

  align-items: center;
  color: var(--theme-subgraph-data-row-color);
  column-gap: var(--base-gap);
  display: grid;
  grid-template-columns: var(--base-status-size) 1fr 10px 1fr;
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.2;

  &::before {
    align-items: center;
    background-color: var(
      ${({ status }) => (status === 'error' ? '--theme-color-danger' : '--theme-color-ok')}
    );
    border-radius: 50%;
    content: '';
    display: flex;
    height: var(--base-status-size);
    width: var(--base-status-size);
    transition: background-color var(--base-transition-duration);
  }
`

const SubgraphStatus: FC<{
  indexingStatus: ReturnType<typeof useSubgraphIndexingStatus>
}> = ({ indexingStatus }) => {
  const { chain, isSynced, networkBlockNumber, resource, subgraphBlockNumber } = indexingStatus

  return (
    <Row>
      <Title title={`${chain.name}`}>{`${resource}@${chain.id}`}</Title>
      <Data status={isSynced ? `ok` : `error`}>
        <span>
          <b>SG:</b> {subgraphBlockNumber.toString()}
        </span>
        <span>-</span>
        <span>
          <b>BC:</b>
          {networkBlockNumber?.toString() ?? '-'}
        </span>
      </Data>
    </Row>
  )
}

const Uniswap = withSuspenseAndRetry(({ chain }: { chain: Chain }) => {
  const indexingStatus = useSubgraphIndexingStatus({ chain, resource: 'uniswap' })

  return <SubgraphStatus indexingStatus={indexingStatus} />
})

const Aave = withSuspenseAndRetry(() => {
  const indexingStatus = useSubgraphIndexingStatus({ chain: base, resource: 'aave' })

  return <SubgraphStatus indexingStatus={indexingStatus} />
})

const uniswapNetworks = [optimism, polygon, arbitrum]

const List = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      {uniswapNetworks.map((chain) => (
        <Uniswap chain={chain} key={chain.id} />
      ))}
      <Aave />
    </Wrapper>
  )
}

export default List
