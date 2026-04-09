import type { PublicClient } from 'viem'

import { evmReadClientFactory } from '../../core/evm/read-client'
import type { UseReadOnlyReturn } from '../hooks/useReadOnly'
import { useReadOnly } from '../hooks/useReadOnly'

export interface UseEvmReadOnlyOptions {
  chainId: string | number
  address?: string
}

/**
 * Typed EVM read-only hook. Returns a viem PublicClient for the given chain.
 * Self-sufficient — works even without provider readClientFactories configured.
 *
 * @precondition Must be called inside a DAppBoosterProvider
 * @precondition chainId must be an EVM chain registered in the provider
 * @postcondition returns { client: PublicClient | null, chain, address, explorerAddressUrl }
 */
export function useEvmReadOnly(options: UseEvmReadOnlyOptions): UseReadOnlyReturn<PublicClient> {
  return useReadOnly<PublicClient>({ ...options, factory: evmReadClientFactory })
}
