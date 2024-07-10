import { graphql } from '@/src/subgraphs/gql/aave'

export const allAaveReservesQueryDocument = graphql(/* GraphQL */ `
  query allAaveReserves {
    reserves(
      first: 3
      orderBy: price__priceInEth
      orderDirection: desc
      where: { isPaused: false }
    ) {
      id
      underlyingAsset
      name
    }
  }
`)
