import { useSuspenseQuery, UseSuspenseQueryOptions } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { type Chain } from 'viem/chains'

import { appSchemas } from '@/src/subgraphs/utils/appSchemas'

type Query = {
  _meta: {
    block: {
      hash?: string | null
      number: number
      timestamp?: number | null
    }
    deployment: string
    /** If `true`, the subgraph encountered indexing errors at some past block */
    hasIndexingErrors: boolean
  }
}

/**
 * Custom hook to fetch subgraph metadata for a specific chain and resource.
 *
 * @param {Object} params - The parameters for the hook.
 * @param {string} params.chainId - The ID of the chain.
 * @param {Object} [params.options] - Additional options for the useSuspenseQuery hook.
 * @param {string} params.resource - The resource to fetch metadata for.
 * @returns {Object} - The subgraph metadata.
 */
export const useSubgraphMetadata = ({
  chainId,
  options = {},
  resource,
}: {
  chainId: Chain['id']
  options?: Omit<UseSuspenseQueryOptions, 'queryKey' | 'queryFn'>
  resource: string
}) => {
  const { data } = useSuspenseQuery({
    queryKey: ['subgraphMetadata', resource, chainId],
    queryFn: async () => {
      const { _meta } = await request<Query>(
        appSchemas[resource][chainId],
        gql`
          query {
            _meta {
              block {
                hash
                number
                timestamp
              }
              deployment
              hasIndexingErrors
            }
          }
        `,
      )
      return _meta
    },
    refetchInterval: 10_000,
    ...options,
  })

  return data as Query['_meta']
}
