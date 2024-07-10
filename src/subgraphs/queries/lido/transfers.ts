import { graphql } from '@/src/subgraphs/gql/lido'

export const allLidoTransfersQueryDocument = graphql(/* GraphQL */ `
  query allLidoTransfersQuery {
    lidoTransfers(first: 5) {
      id
      from
      to
      value
    }
  }
`)
