import { type Chain } from 'viem'

import { useNetworkBlockNumber } from '@/src/hooks/useNetworkBlockNumber'
import { useSubgraphMetadata } from '@/src/hooks/useSubgraphMetadata'

/**
 * Custom hook to get the indexing status of a subgraph.
 * Uses the network block number to determine if the subgraph is synced.
 *
 * @param {Object} params - The params object.
 * @param {Chain} params.chain - The chain object.
 * @param {string} params.resource - The resource string. To understand the format, see `parseResourceIds` in `src/subgraphs/utils/schemas.ts`.
 * @returns {Object} - The indexing status object.
 */
export const useSubgraphIndexingStatus = ({
  chain,
  resource,
}: {
  chain: Chain
  resource: string
}) => {
  const meta = useSubgraphMetadata({ chainId: chain.id, resource })
  const networkBlockNumber = useNetworkBlockNumber({ chain })

  const subgraphBlockNumber = BigInt(meta?.block.number)

  return {
    resource,
    chain,
    hasIndexingErrors: meta?.hasIndexingErrors,
    isSynced: subgraphBlockNumber === networkBlockNumber,
    networkBlockNumber,
    subgraphBlockNumber,
  }
}
