import { graphql } from '@/src/subgraphs/gql/uniswap'

export const allUniswapPoolsQueryDocument = graphql(/* GraphQL */ `
  query allUniswapPools {
    pools(first: 5) {
      id
      token0Price
      token1Price
      token0 {
        symbol
      }
      token1 {
        symbol
      }
    }
  }
`)
