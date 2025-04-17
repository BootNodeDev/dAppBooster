import { useState } from 'react'
import styled, { css } from 'styled-components'

import { generateSchemasMapping } from '@bootnodedev/db-subgraph'
import {
  CopyButton,
  ExternalLink,
  Item,
  SkeletonLoading,
  Toast,
  breakpointMediaQuery,
} from '@bootnodedev/db-ui-toolkit'
import { useSuspenseQuery } from '@tanstack/react-query'
import request from 'graphql-request'
import { toast } from 'react-hot-toast'
import { type Chain, arbitrum, base, optimism, polygon } from 'viem/chains'

import { OptionsButton } from '@/src/components/pageComponents/home/Examples/demos/OptionsButton'
import { OptionsDropdown } from '@/src/components/pageComponents/home/Examples/demos/OptionsDropdown'
import ArbitrumDefault from '@/src/components/pageComponents/home/Examples/demos/assets/Arbitrum'
import BaseDefault from '@/src/components/pageComponents/home/Examples/demos/assets/Base'
import OptimismDefault from '@/src/components/pageComponents/home/Examples/demos/assets/Optimism'
import PolygonDefault from '@/src/components/pageComponents/home/Examples/demos/assets/Polygon'
import { env } from '@/src/env'
import { allAaveReservesQueryDocument } from '@/src/subgraphs/queries/aave/reserves'
import { allUniswapPoolsQueryDocument } from '@/src/subgraphs/queries/uniswap/pools'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'

const chainNameMapping: { [key: number]: string } = {
  [arbitrum.id]: 'arbitrum',
  [optimism.id]: 'optimism',
  [polygon.id]: 'polygon',
}

const Wrapper = styled.div`
  [data-theme='light'] & {
    --theme-subgraph-title-color: #2e3048;
    --theme-subgraph-name-color: #2e3048;
    --theme-subgraph-bullet-color: #f7f7f7;
    --theme-subgraph-bullet-background-color: #2e3048;
  }

  [data-theme='dark'] & {
    --theme-subgraph-title-color: #fff;
    --theme-subgraph-name-color: #fff;
    --theme-subgraph-bullet-color: #2e3048;
    --theme-subgraph-bullet-background-color: #fff;
  }

  display: flex;
  flex-direction: column;
  padding-top: var(--base-common-padding);
  row-gap: calc(var(--base-gap-xl) * 2);
  width: 100%;

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      padding-top: calc(var(--base-common-padding) * 3);
      row-gap: calc(var(--base-gap-xl) * 3);
    `,
  )}
`

const Group = styled.div`
  counter-reset: item-number;
  display: flex;
  flex-direction: column;
  row-gap: var(--base-gap-xl);
  padding: 0 var(--base-common-padding);

  ${breakpointMediaQuery(
    'desktopStart',
    css`
      padding: 0;
    `,
  )}
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
  padding-bottom: var(--base-common-padding);
`

const Arbitrum = styled(ArbitrumDefault)`
  height: 20px;
  width: 20px;
`

const Polygon = styled(PolygonDefault)`
  height: 20px;
  width: 20px;
`

const Optimism = styled(OptimismDefault)`
  height: 20px;
  width: 20px;
`

const Base = styled(BaseDefault)`
  height: 20px;
  width: 20px;
`

const Row = styled.div`
  align-items: center;
  color: var(--theme-subgraph-name-color);
  column-gap: var(--base-gap);
  display: flex;

  &::before {
    --base-size: 18px;

    align-items: center;
    background-color: var(--theme-subgraph-bullet-background-color);
    border-radius: 50%;
    color: var(--theme-subgraph-bullet-color);
    content: counter(item-number, decimal-leading-zero);
    counter-increment: item-number;
    display: flex;
    flex-shrink: 0;
    font-size: 1rem;
    font-weight: 700;
    height: var(--base-size);
    justify-content: center;
    letter-spacing: -1px;
    line-height: 1;
    padding-right: 2px;
    width: var(--base-size);
  }
`

const Name = styled.div`
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`

const Copy = ({ value }: { value: string }) => {
  const handleCopy = () => {
    const timeDelay = 2500
    toast.custom(<Toast>Copied to the clipboard!</Toast>, {
      duration: timeDelay,
      position: 'top-center',
      id: 'copy-to-clipboard',
    })
  }

  return (
    <CopyButton
      onClick={handleCopy}
      value={value}
      aria-label="Copy"
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const getNetworkIcon = (chainName: string) => (
  <>
    {chainName === 'arbitrum one' && <Arbitrum />}
    {chainName === 'polygon' && <Polygon />}
    {chainName === 'op mainnet' && <Optimism />}
    {chainName === 'base' && <Base />}
  </>
)

export const SkeletonLoadingItem = () => (
  <SkeletonLoading
    $animate={false}
    style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'auto',
      minHeight: '133px',
      padding: '16px',
      rowGap: '9px',
      width: '100%',
    }}
  >
    <SkeletonLoading style={{ width: '40%', height: '28px', paddingBottom: '8px' }} />
    <SkeletonLoading style={{ width: '100%', height: '16px' }} />
    <SkeletonLoading style={{ width: '100%', height: '16px' }} />
    <SkeletonLoading style={{ width: '100%', height: '16px' }} />
  </SkeletonLoading>
)

const appSchemas = generateSchemasMapping({
  // biome-ignore lint/style/noNonNullAssertion: somebody else's code
  apiKey: env.PUBLIC_SUBGRAPHS_API_KEY!,
  // biome-ignore lint/style/noNonNullAssertion: somebody else's code
  chainsResourceIds: env.PUBLIC_SUBGRAPHS_CHAINS_RESOURCE_IDS!,
  environment: env.PUBLIC_SUBGRAPHS_ENVIRONMENT,
  productionUrl: env.PUBLIC_SUBGRAPHS_PRODUCTION_URL,
})

const Uniswap = withSuspenseAndRetry(({ chain }: { chain: Chain }) => {
  const { data } = useSuspenseQuery({
    queryKey: ['allUniswapPools', chain.id],
    queryFn: async () => {
      const { positions } = await request(
        appSchemas.uniswap[chain.id],
        allUniswapPoolsQueryDocument,
      )
      return positions
    },
  })

  const baseUrl = `https://app.uniswap.org/explore/pools/${chainNameMapping[chain.id]}/`

  return (
    <Group>
      <Title title={chain.name}>Uniswap Pool {getNetworkIcon(chain.name.toLowerCase())}</Title>
      {data.map((position) => (
        <Row key={position.id}>
          <Name>{position.pool.symbol}</Name>
          <Copy value={position.pool.id} />
          <ExternalLink
            href={`${baseUrl}${position.pool.id}`}
            aria-label="Explore"
          />
        </Row>
      ))}
    </Group>
  )
})

const Aave = withSuspenseAndRetry(() => {
  const { data } = useSuspenseQuery({
    queryKey: ['allAaveReserves', base.id],
    queryFn: async () => {
      const { reserves } = await request(appSchemas.aave[base.id], allAaveReservesQueryDocument)
      return reserves
    },
  })
  const baseUrl = 'https://app.aave.com/reserve-overview/?marketName=proto_base_v3&underlyingAsset='

  return (
    <Group>
      <Title title={base.name}>
        AAVE Reserves
        {getNetworkIcon(base.name.toLowerCase())}
      </Title>
      {data.map(({ id, name, underlyingAsset }) => (
        <Row key={id}>
          <Name>{name}</Name>
          <Copy value={underlyingAsset} />
          <ExternalLink
            href={`${baseUrl}${underlyingAsset}`}
            aria-label="Explore"
          />
        </Row>
      ))}
    </Group>
  )
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
