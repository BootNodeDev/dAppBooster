import styled, { css } from 'styled-components'

import { useSuspenseQuery } from '@tanstack/react-query'
import {
  ExternalLink,
  CopyButton,
  Toast,
  SkeletonLoading,
  breakpointMediaQuery,
} from 'db-ui-toolkit'
import request from 'graphql-request'
import { toast } from 'react-hot-toast'
import { arbitrum, base, type Chain, optimism, polygon } from 'viem/chains'

import ArbitrumDefault from '@/src/components/pageComponents/home/Examples/demos/assets/Arbitrum'
import BaseDefault from '@/src/components/pageComponents/home/Examples/demos/assets/Base'
import OptimismDefault from '@/src/components/pageComponents/home/Examples/demos/assets/Optimism'
import PolygonDefault from '@/src/components/pageComponents/home/Examples/demos/assets/Polygon'
import { allAaveReservesQueryDocument } from '@/src/subgraphs/queries/aave/reserves'
import { allUniswapPoolsQueryDocument } from '@/src/subgraphs/queries/uniswap/pools'
import { appSchemas } from '@/src/subgraphs/utils/appSchemas'
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
  max-width: 100%;
  padding: 0 var(--base-common-padding-xl);
  row-gap: calc(var(--base-gap-xl) * 2);

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      padding: var(--base-common-padding-xl);
      row-gap: calc(var(--base-gap-xl) * 3);
    `,
  )}
`

const Group = styled.div`
  counter-reset: item-number;
  display: flex;
  flex-direction: column;
  row-gap: var(--base-gap-xl);
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

  return <CopyButton onClick={handleCopy} value={value} />
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
      <Title title={chain.name}>
        Uniswap pools
        {getNetworkIcon(chain.name.toLowerCase())}
      </Title>
      {data.map((position) => (
        <Row key={position.id}>
          <Name>{position.pool.symbol}</Name>
          <Copy value={position.pool.id} />
          <ExternalLink href={`${baseUrl}${position.pool.id}`} />
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
          <ExternalLink href={`${baseUrl}${underlyingAsset}`} />
        </Row>
      ))}
    </Group>
  )
})

const uniswapNetworks = [optimism, polygon, arbitrum]

export const SkeletonLoadingItem = () => (
  <SkeletonLoading
    $animate={false}
    style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'auto',
      minHeight: '133px',
      padding: '16px',
      rowGap: '16px',
      width: '340px',
    }}
  >
    <SkeletonLoading style={{ width: '40%', height: '28px' }} />
    <SkeletonLoading style={{ width: '100%', height: '19px' }} />
  </SkeletonLoading>
)

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
