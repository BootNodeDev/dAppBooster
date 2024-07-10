import styled from 'styled-components'

import { useSuspenseQuery } from '@tanstack/react-query'
import { ExternalLink } from 'db-ui-toolkit'
import request from 'graphql-request'
import { arbitrum, base, type Chain, optimism, polygon } from 'viem/chains'

import { env } from '@/src/env'
import { allAaveReservesQueryDocument } from '@/src/subgraphs/queries/aave/reserves'
import { allUniswapPoolsQueryDocument } from '@/src/subgraphs/queries/uniswap/pools'
import { generateSchemas, parseResourceIds } from '@/src/utils/subgraphs'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'

const schemas = generateSchemas(
  parseResourceIds(env.PUBLIC_SUBGRAPHS_CHAINS_RESOURCE_IDS!),
  env.PUBLIC_SUBGRAPHS_API_KEY!,
  env.PUBLIC_SUBGRAPHS_ENVIRONMENT!,
  {
    development: env.PUBLIC_SUBGRAPHS_DEVELOPMENT_URL!,
    production: env.PUBLIC_SUBGRAPHS_PRODUCTION_URL!,
  },
)

const uniswapNetworks = [optimism, polygon, arbitrum] // same order as defined in useQueries

const chainNameMapping = {
  [optimism.id]: 'optimism',
  [polygon.id]: 'polygon',
  [arbitrum.id]: 'arbitrum',
} as const

const DataRow = styled.div`
  display: flex;
  align-items: center;
  column-gap: 10px;
`

const Uniswap = withSuspenseAndRetry(({ chain }: { chain: Chain }) => {
  const { data } = useSuspenseQuery({
    queryKey: ['allUniswapPools', chain.id],
    queryFn: async () => {
      const { positions } = await request(schemas.uniswap[chain.id], allUniswapPoolsQueryDocument)
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
      const { reserves } = await request(schemas.aave[base.id], allAaveReservesQueryDocument)
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
