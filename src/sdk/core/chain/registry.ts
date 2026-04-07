import { ChainRegistryConflictError } from '../errors'
import type { ChainDescriptor } from './descriptor'

/** Read-only interface for looking up chain descriptors by various keys. */
export interface ChainRegistry {
  /** Returns the descriptor for the given native chainId, or null if not found. */
  getChain(chainId: string | number): ChainDescriptor | null
  /** Returns the descriptor for the given CAIP-2 identifier, or null if not found. */
  getChainByCaip2(caip2Id: string): ChainDescriptor | null
  /** Returns the chainType string for the given chainId, or null if not found. */
  getChainType(chainId: string | number): string | null
  /** Returns all descriptors whose chainType matches the given value. */
  getChainsByType(chainType: string): ChainDescriptor[]
  /** Returns all registered chain descriptors. */
  getAllChains(): ChainDescriptor[]
}

/**
 * Creates an immutable ChainRegistry from the provided descriptors.
 *
 * Throws ChainRegistryConflictError at construction time if any two descriptors
 * share the same chainId or the same caip2Id.
 */
export function createChainRegistry(chains: ChainDescriptor[]): ChainRegistry {
  const byChainId = new Map<string | number, ChainDescriptor>()
  const byCaip2Id = new Map<string, ChainDescriptor>()

  for (const descriptor of chains) {
    if (byChainId.has(descriptor.chainId)) {
      throw new ChainRegistryConflictError({
        chainId: descriptor.chainId,
        caip2Id: descriptor.caip2Id,
        conflictOn: 'chainId',
      })
    }

    if (byCaip2Id.has(descriptor.caip2Id)) {
      throw new ChainRegistryConflictError({
        chainId: descriptor.chainId,
        caip2Id: descriptor.caip2Id,
        conflictOn: 'caip2Id',
      })
    }

    byChainId.set(descriptor.chainId, descriptor)
    byCaip2Id.set(descriptor.caip2Id, descriptor)
  }

  const allChains = [...chains]

  function lookupByChainId(chainId: string | number): ChainDescriptor | null {
    const direct = byChainId.get(chainId)
    if (direct) {
      return direct
    }
    // Try coerced alternative: string "1" → number 1, or number 1 → string "1"
    const alt = typeof chainId === 'string' ? Number(chainId) : String(chainId)
    if (typeof chainId === 'string' && Number.isNaN(alt as number)) {
      return null
    }
    return byChainId.get(alt) ?? null
  }

  return {
    getChain(chainId) {
      return lookupByChainId(chainId)
    },

    getChainByCaip2(caip2Id) {
      return byCaip2Id.get(caip2Id) ?? null
    },

    getChainType(chainId) {
      return lookupByChainId(chainId)?.chainType ?? null
    },

    getChainsByType(chainType) {
      return allChains.filter((descriptor) => descriptor.chainType === chainType)
    },

    getAllChains() {
      return [...allChains]
    },
  }
}
