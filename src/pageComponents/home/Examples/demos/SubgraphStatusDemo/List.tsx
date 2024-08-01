import { type FC } from 'react'
import styled, { css } from 'styled-components'

import { SkeletonLoading, breakpointMediaQuery } from 'db-ui-toolkit'
import { arbitrum, base, type Chain, optimism, polygon } from 'viem/chains'

import { useSubgraphIndexingStatus } from '@/src/hooks/useSubgraphIndexingStatus'
import { getNetworkIcon } from '@/src/pageComponents/home/Examples/demos/SubgraphDemo/List'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'

const Wrapper = styled.div`
  [data-theme='light'] & {
    --theme-subgraph-status-background: #fff;
    --theme-subgraph-status-data-row-color: #2e3048;
    --theme-subgraph-status-data-color: #5f6178;
  }

  [data-theme='dark'] & {
    --theme-subgraph-status-background: #373954;
    --theme-subgraph-status-data-row-color: #fff;
    --theme-subgraph-status-data-color: #e2e0e7;
  }

  display: flex;
  flex-direction: column;
  padding: 0 var(--base-common-padding);
  row-gap: var(--base-gap-xl);
  width: 100%;

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      width: auto;
    `,
  )}
`

const Row = styled.div`
  background-color: var(--theme-subgraph-status-background);
  border-radius: var(--base-border-radius);
  display: flex;
  flex-direction: column;
  padding: var(--base-common-padding-xl);
  row-gap: var(--base-gap-xl);
  width: 100%;
`

const Title = styled.h3`
  align-items: center;
  color: var(--theme-subgraph-title-color);
  column-gap: var(--base-gap);
  display: flex;
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
`

const Data = styled.div<{ $status: 'error' | 'ok' }>`
  --base-status-size: 10px;

  align-items: center;
  color: var(--theme-subgraph-status-data-row-color);
  column-gap: var(--base-gap);
  display: grid;
  font-size: 1.6rem;
  font-weight: 400;
  grid-template-columns: var(--base-status-size) 1fr;
  line-height: 1.2;
  white-space: nowrap;

  &::before {
    align-items: center;
    background-color: var(
      ${({ $status }) => ($status === 'error' ? '--theme-color-danger' : '--theme-color-ok')}
    );
    border-radius: 50%;
    content: '';
    display: flex;
    height: var(--base-status-size);
    width: var(--base-status-size);
    transition: background-color var(--base-transition-duration);
  }

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      grid-template-columns: var(--base-status-size) 1fr 10px 1fr;
    `,
  )}
`

const SG = styled.span``

const Separator = styled.span`
  display: none;

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      display: block;
    `,
  )}
`

const BC = styled.span`
  padding-left: calc(var(--base-status-size) + var(--base-gap));

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      padding-left: 0;
    `,
  )}
`

export const SkeletonLoadingItem = () => (
  <SkeletonLoading
    $animate={false}
    style={{
      height: 'auto',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '55px',
      padding: '16px',
      rowGap: '16px',
      width: '272px',
    }}
  >
    <SkeletonLoading style={{ width: '40%', minHeight: '20px' }} />
    <SkeletonLoading style={{ width: '100%', minHeight: '19px' }} />
  </SkeletonLoading>
)

const SubgraphStatus: FC<{
  indexingStatus: ReturnType<typeof useSubgraphIndexingStatus>
}> = ({ indexingStatus }) => {
  const { chain, isSynced, networkBlockNumber, resource, subgraphBlockNumber } = indexingStatus

  return (
    <Row>
      <Title title={chain.name}>
        {`${resource}@${chain.id}`}
        {getNetworkIcon(chain.name.toLowerCase())}
      </Title>
      <Data $status={isSynced ? `ok` : `error`}>
        <SG>
          <b>SG:</b> {subgraphBlockNumber.toString()}
        </SG>
        <Separator>-</Separator>
        <BC>
          <b>BC:</b>
          {networkBlockNumber?.toString() ?? '-'}
        </BC>
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
        <Uniswap chain={chain} key={chain.id} suspenseFallback={<SkeletonLoadingItem />} />
      ))}
      <Aave suspenseFallback={<SkeletonLoadingItem />} />
    </Wrapper>
  )
}

export default List
