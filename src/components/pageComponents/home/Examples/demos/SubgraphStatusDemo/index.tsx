import { type FC, useState } from 'react'
import styled, { css } from 'styled-components'

import { type SchemaMappingConfig, useSubgraphIndexingStatus } from '@bootnodedev/db-subgraph'
import { Item, SkeletonLoading, breakpointMediaQuery } from '@bootnodedev/db-ui-toolkit'
import { type Chain, arbitrum, base, optimism, polygon } from 'viem/chains'

import { OptionsButton } from '@/src/components/pageComponents/home/Examples/demos/OptionsButton'
import { OptionsDropdown } from '@/src/components/pageComponents/home/Examples/demos/OptionsDropdown'
import { getNetworkIcon } from '@/src/components/pageComponents/home/Examples/demos/SubgraphDemo'
import { env } from '@/src/env'
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
  padding: var(--base-common-padding) 0 0;
  row-gap: var(--base-gap-xl);
  width: 100%;

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      padding-top: calc(var(--base-common-padding) * 3);
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
  max-width: 100%;
  white-space: nowrap;
  width: fit-content;

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
      grid-template-columns: var(--base-status-size) auto 10px auto;
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
      width: '100%',
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
      <Data $status={isSynced ? 'ok' : 'error'}>
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

// define the schema configuration for the current implementation and needs
const schemaConfig: SchemaMappingConfig = {
  apiKey: env.PUBLIC_SUBGRAPHS_API_KEY,
  chainsResourceIds: env.PUBLIC_SUBGRAPHS_CHAINS_RESOURCE_IDS,
  environment: env.PUBLIC_SUBGRAPHS_ENVIRONMENT,
  productionUrl: env.PUBLIC_SUBGRAPHS_PRODUCTION_URL,
}

const Uniswap = withSuspenseAndRetry(({ chain }: { chain: Chain }) => {
  const indexingStatus = useSubgraphIndexingStatus({ chain, resource: 'uniswap', schemaConfig })

  return <SubgraphStatus indexingStatus={indexingStatus} />
})

const Aave = withSuspenseAndRetry(() => {
  const indexingStatus = useSubgraphIndexingStatus({ chain: base, resource: 'aave', schemaConfig })

  return <SubgraphStatus indexingStatus={indexingStatus} />
})

const uniswapNetworks = [optimism, polygon, arbitrum]

const List = ({ ...restProps }) => {
  const [currentChain, setCurrentChain] = useState<Chain | undefined>(uniswapNetworks[0])
  const dropdownItems = [...uniswapNetworks, base]

  return (
    <Wrapper {...restProps}>
      <OptionsDropdown
        button={
          <OptionsButton>
            {dropdownItems.find((item) => item.name === currentChain?.name)?.name}
          </OptionsButton>
        }
        defaultActiveItem={0}
        items={dropdownItems.map((item) => (
          <Item
            key={`${item.id}`}
            onClick={() => setCurrentChain(item)}
          >
            {item.name}
          </Item>
        ))}
      />
      {uniswapNetworks.map(
        (chain) =>
          currentChain?.id === chain.id && (
            <Uniswap
              chain={chain}
              key={chain.id}
              suspenseFallback={<SkeletonLoadingItem />}
            />
          ),
      )}
      {currentChain?.id === base.id && <Aave suspenseFallback={<SkeletonLoadingItem />} />}
    </Wrapper>
  )
}

export default List
