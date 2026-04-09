import { useMemo } from 'react'

import type { ReadClientFactory } from '../../core/adapters/provider'
import type { ChainDescriptor } from '../../core/chain'
import { getExplorerUrl } from '../../core/chain/explorer'
import { useProviderContext } from '../provider/context'

export interface UseReadOnlyOptions<TClient = unknown> {
  chainId: string | number
  address?: string
  /**
   * Level 4 escape hatch: explicit factory — bypasses provider resolution.
   * @precondition factory.chainType should match the chain's chainType
   */
  factory?: ReadClientFactory<TClient>
}

export interface UseReadOnlyReturn<TClient = unknown> {
  chain: ChainDescriptor | null
  /** Read-only client created by the matching factory. null if no factory registered or chain not found. */
  client: TClient | null
  /** The address passed in options, or null if not provided. */
  address: string | null
  /** Explorer URL for the given address, or null if address or explorer config is missing. */
  explorerAddressUrl: string | null
}

/**
 * Returns the ChainDescriptor, a read-only client, and optional address info for the given chainId.
 * The client is created by the matching ReadClientFactory — either from the explicit `factory` option
 * (Level 4 bypass) or from the provider's readClientFactories.
 *
 * @precondition Must be called inside a DAppBoosterProvider
 * @precondition options.chainId identifies a chain registered in the provider config
 * @postcondition returns chain descriptor and read-only client (null when chain/factory/endpoint missing)
 * @postcondition returns address as-is from options, or null when not provided
 * @postcondition returns explorerAddressUrl when both address and chain explorer config are present
 */
export function useReadOnly<TClient = unknown>(
  options: UseReadOnlyOptions<TClient>,
): UseReadOnlyReturn<TClient> {
  const { registry, readClientFactories } = useProviderContext()

  const chain = useMemo(() => registry.getChain(options.chainId), [registry, options.chainId])

  const client = useMemo(() => {
    if (!chain) {
      return null
    }

    const endpoint = chain.endpoints?.[0]
    if (!endpoint) {
      return null
    }

    if (options.factory) {
      return options.factory.createClient(endpoint, chain.chainId)
    }

    const providerFactory = readClientFactories.find((f) => f.chainType === chain.chainType)
    if (!providerFactory) {
      return null
    }
    return providerFactory.createClient(endpoint, chain.chainId) as TClient
  }, [chain, readClientFactories, options.factory])

  const address = options.address ?? null

  const explorerAddressUrl = useMemo(() => {
    if (!address) {
      return null
    }
    return getExplorerUrl(registry, { chainId: options.chainId, address })
  }, [registry, options.chainId, address])

  return { chain, client, address, explorerAddressUrl }
}
