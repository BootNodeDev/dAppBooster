import styled from 'styled-components'

import { useQueries, UseQueryResult } from '@tanstack/react-query'
import { ExternalLink } from 'db-ui-toolkit'
import request from 'graphql-request'
import { arbitrum, base, type Chain, optimism, polygon } from 'viem/chains'

import { env } from '@/src/env'
import { AllAaveReservesQuery } from '@/src/subgraphs/gql/aave/graphql'
import type { AllUniswapPoolsQuery } from '@/src/subgraphs/gql/uniswap/graphql'
import { allAaveReservesQueryDocument } from '@/src/subgraphs/queries/aave/reserves'
import { allUniswapPoolsQueryDocument } from '@/src/subgraphs/queries/uniswap/pools'
import { generateSchemas, parseResourceIds } from '@/src/utils/subgraphs'

const schemas = generateSchemas(
  parseResourceIds(env.PUBLIC_SUBGRAPHS_CHAINS_RESOURCE_IDS!),
  env.PUBLIC_SUBGRAPHS_API_KEY!,
  env.PUBLIC_SUBGRAPHS_ENVIRONMENT!,
  {
    development: env.PUBLIC_SUBGRAPHS_DEVELOPMENT_URL!,
    production: env.PUBLIC_SUBGRAPHS_PRODUCTION_URL!,
  },
)

const Subgraph = () => {
  const uniswapNetworks = [optimism, polygon, arbitrum] // same order as defined in useQueries

  const results = useQueries({
    queries: [
      {
        queryKey: ['allUniswapPools', uniswapNetworks[0].id],
        queryFn: async () => {
          const { positions } = await request(
            schemas.uniswap[uniswapNetworks[0].id],
            allUniswapPoolsQueryDocument,
          )
          return positions
        },
      },
      {
        queryKey: ['allUniswapPools', uniswapNetworks[1].id],
        queryFn: async () => {
          const { positions } = await request(
            schemas.uniswap[uniswapNetworks[1].id],
            allUniswapPoolsQueryDocument,
          )
          return positions
        },
      },
      {
        queryKey: ['allUniswapPools', uniswapNetworks[2].id],
        queryFn: async () => {
          const { positions } = await request(
            schemas.uniswap[uniswapNetworks[2].id],
            allUniswapPoolsQueryDocument,
          )
          return positions
        },
      },
      {
        queryKey: ['allAaveReserves', base.id],
        queryFn: async () => {
          const { reserves } = await request(schemas.aave[base.id], allAaveReservesQueryDocument)
          return reserves
        },
      },
    ],
  })

  return results.map((result, index) => {
    if (index < 3) {
      return (
        <Uniswap
          chain={uniswapNetworks[index]}
          key={`uniswap-${uniswapNetworks[index].name}`}
          result={result as UseQueryResult<AllUniswapPoolsQuery['positions']>}
          title={`Uniswap pools on ${uniswapNetworks[index].name}`}
        />
      )
    }

    return (
      <Aave
        key={`aave-${base.name}`}
        result={result as UseQueryResult<AllAaveReservesQuery['reserves']>}
        title={`Aave reserves on ${base.name}`}
      />
    )
  })
}

const DataRow = styled.div`
  display: flex;
  align-items: center;
  column-gap: 10px;
`

const chainNameMapping = {
  [optimism.id]: 'optimism',
  [polygon.id]: 'polygon',
  [arbitrum.id]: 'arbitrum',
}

function Uniswap({
  chain,
  result,
  title,
}: {
  chain: Chain
  result: UseQueryResult<AllUniswapPoolsQuery['positions']>
  title: string
}) {
  const baseUrl = `https://app.uniswap.org/explore/pools/${chainNameMapping[chain.id]}/`
  let content = null

  if (result.isPending) {
    content = <div>Loading...</div>
  } else if (!result.data) {
    content = <div>Unable to find info</div>
  } else {
    content = result.data.map((position) => (
      <DataRow key={position.id}>
        <div>{position.pool.symbol}</div>
        <ExternalLink href={`${baseUrl}${position.pool.id}`} />
      </DataRow>
    ))
  }

  return (
    <>
      <strong>{title}</strong>
      {content}
    </>
  )
}

function Aave({
  result,
  title,
}: {
  result: UseQueryResult<AllAaveReservesQuery['reserves']>
  title: string
}) {
  const baseUrl = 'https://app.aave.com/reserve-overview/?marketName=proto_base_v3&underlyingAsset='
  let content = null

  if (result.isPending) {
    content = <div>Loading...</div>
  } else if (!result.data) {
    content = <div>Unable to find info</div>
  } else {
    content = result.data.map((reserve) => (
      <DataRow key={reserve.id}>
        <div>{reserve.name}</div>
        <ExternalLink href={`${baseUrl}${reserve.underlyingAsset}`} />
      </DataRow>
    ))
  }

  return (
    <>
      <strong>{title}</strong>
      {content}
    </>
  )
}

export default Subgraph
