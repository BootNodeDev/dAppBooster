import { graphql } from '@/src/subgraphs/gql/compound'

export const allCompoundTokensQueryDocument = graphql(/* GraphQL */ `
  query allCompoundTokensQuery {
    tokens(first: 5) {
      id
      name
      symbol
      lastPriceUSD
    }
  }
`)
