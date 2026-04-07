import { useMemo } from 'react'
import type { ChainDescriptor } from '../../core/chain'
import { useProviderContext } from '../provider/context'

export interface UseReadOnlyOptions {
  chainId: string | number
}

export interface UseReadOnlyReturn {
  chain: ChainDescriptor | null
  /** Opaque read-only client created by the matching ReadClientFactory. null if no factory registered. */
  client: unknown
}

/**
 * Returns the ChainDescriptor and a read-only client for the given chainId.
 * The client is created by the matching ReadClientFactory registered in DAppBoosterConfig.
 * Returns null for client if no factory is registered or the chain has no endpoints.
 */
export function useReadOnly(options: UseReadOnlyOptions): UseReadOnlyReturn {
  const { registry, readClientFactories } = useProviderContext()

  const chain = useMemo(() => registry.getChain(options.chainId), [registry, options.chainId])

  const client = useMemo(() => {
    if (!chain) {
      return null
    }
    const factory = readClientFactories.find((f) => f.chainType === chain.chainType)
    if (!factory) {
      return null
    }
    const endpoint = chain.endpoints?.[0]
    if (!endpoint) {
      return null
    }
    return factory.createClient(endpoint, chain.chainId)
  }, [chain, readClientFactories])

  return { chain, client }
}
