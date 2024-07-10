import { graphql } from '@/src/subgraphs/gql/uniswap'

export const allUniswapPoolsQueryDocument = graphql(/* GraphQL */ `
  query allUniswapPools {
    positions(first: 3, orderBy: liquidityUSD, orderDirection: asc) {
      id
      pool {
        id
        symbol
      }
    }
  }
`)
