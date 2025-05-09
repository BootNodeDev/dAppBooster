import { useMemo } from 'react'

import { type UseSuspenseQueryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { http, createPublicClient } from 'viem'
import type { Chain } from 'viem/chains'

/**
 * Custom hook to fetch the block number of a specific network.
 *
 * Creates a dedicated public client specifically for the provided chain,
 * regardless of whether it's supported in the app configuration.
 * Uses TanStack Query's suspense mode for data fetching.
 *
 * @param {Object} params - The parameters object
 * @param {Chain} params.chain - The viem chain object for the target network
 * @param {Omit<UseSuspenseQueryOptions, 'queryKey' | 'queryFn'>} [params.options] - Optional TanStack Query options
 *
 * @returns {bigint|undefined} The current block number as a bigint
 *
 * @example
 * ```tsx
 * const blockNumber = useNetworkBlockNumber({
 *   chain: optimism,
 *   options: { refetchInterval: 5000 }
 * });
 * ```
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
