import type { ChainRegistry } from '../../core/chain/registry'
import { useProviderContext } from '../provider/context'

/**
 * Returns the ChainRegistry from the nearest DAppBoosterProvider.
 *
 * @precondition Must be called inside a DAppBoosterProvider
 * @postcondition returns the provider's ChainRegistry
 * @throws {Error} When called outside a DAppBoosterProvider (via useProviderContext)
 */
export function useChainRegistry(): ChainRegistry {
  return useProviderContext().registry
}
