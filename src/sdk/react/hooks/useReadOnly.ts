import { useMemo } from 'react'
import type { ChainDescriptor } from '../../core/chain'
import { getExplorerUrl } from '../../core/chain/explorer'
import { useProviderContext } from '../provider/context'

export interface UseReadOnlyOptions {
  chainId: string | number
  address?: string
}

export interface UseReadOnlyReturn {
  chain: ChainDescriptor | null
  /** Opaque read-only client created by the matching ReadClientFactory. null if no factory registered. */
  client: unknown
  /** The address passed in options, or null if not provided. */
  address: string | null
  /** Explorer URL for the given address, or null if address or explorer config is missing. */
  explorerAddressUrl: string | null
}

/**
 * Returns the ChainDescriptor, a read-only client, and optional address info for the given chainId.
 * The client is created by the matching ReadClientFactory registered in DAppBoosterConfig.
 *
 * @precondition Must be called inside a DAppBoosterProvider
 * @precondition options.chainId identifies a chain registered in the provider config
 * @postcondition returns chain descriptor and read-only client (null when chain/factory/endpoint missing)
 * @postcondition returns address as-is from options, or null when not provided
 * @postcondition returns explorerAddressUrl when both address and chain explorer config are present, null otherwise
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

  const address = options.address ?? null

  const explorerAddressUrl = useMemo(() => {
    if (!address) {
      return null
    }
    return getExplorerUrl(registry, { chainId: options.chainId, address })
  }, [registry, options.chainId, address])

  return { chain, client, address, explorerAddressUrl }
}
