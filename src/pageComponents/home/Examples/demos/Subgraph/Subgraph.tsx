import styled from 'styled-components'

import { useSuspenseQuery } from '@tanstack/react-query'
import { ExternalLink } from 'db-ui-toolkit'
import request from 'graphql-request'
import { arbitrum, base, type Chain, optimism, polygon } from 'viem/chains'

import { allAaveReservesQueryDocument } from '@/src/subgraphs/queries/aave/reserves'
import { allUniswapPoolsQueryDocument } from '@/src/subgraphs/queries/uniswap/pools'
import { appSchemas } from '@/src/subgraphs/utils/appSchemas'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'

const chainNameMapping: { [key: number]: string } = {
  [optimism.id]: 'optimism',
  [polygon.id]: 'polygon',
  [arbitrum.id]: 'arbitrum',
}

const DataRow = styled.div`
  display: flex;
  align-items: center;
  column-gap: 10px;
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
    <>
      <strong>Uniswap pools on {chain.name}</strong>
      {data.map((position) => (
        <DataRow key={position.id}>
          <div>{position.pool.symbol}</div>
          <ExternalLink href={`${baseUrl}${position.pool.id}`} />
        </DataRow>
      ))}
    </>
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
    <>
      <strong>Aave Reserves on {base.name}</strong>
      {data.map((reserve) => (
        <DataRow key={reserve.id}>
          <div>{reserve.name}</div>
          <ExternalLink href={`${baseUrl}${reserve.underlyingAsset}`} />
        </DataRow>
      ))}
    </>
  )
})

const uniswapNetworks = [optimism, polygon, arbitrum]

const Subgraph = () => {
  return (
    <>
      {uniswapNetworks.map((chain) => (
        <Uniswap chain={chain} key={chain.id} />
      ))}
      <Aave />
    </>
  )
}

export default Subgraph
