import type { ChainRegistry } from '../../core/chain/registry'
import { useProviderContext } from '../provider/context'

/** Returns the ChainRegistry from the nearest DAppBoosterProvider. */
export function useChainRegistry(): ChainRegistry {
  return useProviderContext().registry
}
