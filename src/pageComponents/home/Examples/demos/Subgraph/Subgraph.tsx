import styled from 'styled-components'

import { useSuspenseQuery } from '@tanstack/react-query'
import { ExternalLink, CopyButton } from 'db-ui-toolkit'
import request from 'graphql-request'
import { arbitrum, base, type Chain, optimism, polygon } from 'viem/chains'

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
  display: flex;
  flex-direction: column;
  padding: var(--base-common-padding-xl);
  row-gap: calc(var(--base-gap-xl) * 2);
`

const Group = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: var(--base-gap-xl);
`

const Title = styled.h3`
  color: var(--theme-subgraph-title-color);
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  padding-bottom: var(--base-common-padding);
`

const DataRow = styled.div`
  column-gap: var(--base-gap);
  display: flex;
`

const Name = styled.div`
  color: var(--theme-subgraph-name-color);
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.2;
`

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
      <Title>Uniswap pools on {chain.name}</Title>
      {data.map((position) => (
        <DataRow key={position.id}>
          <Name>{position.pool.symbol}</Name>
          <CopyButton value={position.pool.id} />
          <ExternalLink href={`${baseUrl}${position.pool.id}`} />
        </DataRow>
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
      <Title>AAVE Reserves on {base.name}</Title>
      {data.map(({ id, name, underlyingAsset }) => (
        <DataRow key={id}>
          <Name>{name}</Name>
          <CopyButton value={underlyingAsset} />
          <ExternalLink href={`${baseUrl}${underlyingAsset}`} />
        </DataRow>
      ))}
    </Group>
  )
})

const uniswapNetworks = [optimism, polygon, arbitrum]

const Subgraph = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      {uniswapNetworks.map((chain) => (
        <Uniswap chain={chain} key={chain.id} />
      ))}
      <Aave />
    </Wrapper>
  )
}

export default Subgraph
