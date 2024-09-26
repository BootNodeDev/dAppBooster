import { useMemo } from 'react'

import { type UseSuspenseQueryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { http, createPublicClient } from 'viem'
import type { Chain } from 'viem/chains'

/**
 * Custom hook to fetch the block number of a specific network, despite being supported or not by the app config.
 *
 * @param {Object} params - The parameters for the hook.
 * @param {Chain} params.chain - The chain object representing the network.
 * @param {Omit<UseSuspenseQueryOptions, 'queryKey' | 'queryFn'>} [params.options] - Additional options for the useSuspenseQuery hook.
 *
 * @dev It has a default refetch interval of 10 seconds that can be overridden by passing the options object.
 *
 * @returns {number | undefined} - The block number of the network.
 */
export const useNetworkBlockNumber = ({
  chain,
  options,
}: {
  chain: Chain
  options?: Omit<UseSuspenseQueryOptions, 'queryKey' | 'queryFn'>
}) => {
  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain,
        transport: http(),
      }),
    [chain],
  )

  const { data } = useSuspenseQuery({
    queryKey: ['networkBlockNumber', chain.id],
    queryFn: async () => publicClient.getBlockNumber(),
    refetchInterval: 10_000,
    ...options,
  })

  return data as bigint | undefined
}
