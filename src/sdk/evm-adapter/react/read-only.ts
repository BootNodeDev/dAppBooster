import type { PublicClient } from 'viem'
import type { UseReadOnlyReturn } from '../../react/hooks/useReadOnly'
import { useReadOnly } from '../../react/hooks/useReadOnly'
import { evmReadClientFactory } from '../read-client'

export interface UseEvmReadOnlyOptions {
  chainId: string | number
  address?: string
}

/**
 * Typed EVM read-only hook. Returns a viem PublicClient for the given chain.
 * Self-sufficient — works even without provider readClientFactories configured.
 *
 * @expects Must be called inside a DAppBoosterProvider
 * @expects chainId must be an EVM chain registered in the provider
 * @postcondition returns { client: PublicClient | null, chain, address, explorerAddressUrl }
 */
export function useEvmReadOnly(options: UseEvmReadOnlyOptions): UseReadOnlyReturn<PublicClient> {
  return useReadOnly<PublicClient>({ ...options, factory: evmReadClientFactory })
}
