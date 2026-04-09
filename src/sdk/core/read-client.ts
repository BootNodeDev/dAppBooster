import type { ReadClientFactory } from './adapters/provider'
import type { ChainRegistry } from './chain/registry'

/**
 * Creates a typed read-only client using a specific factory.
 * For CLI tools, agent scripts, and other non-React consumers.
 *
 * @expects chainId is registered in the registry
 * @postcondition returns a typed client, or null if chain/endpoint not found
 */
export function createReadClient<TClient>(
  factory: ReadClientFactory<TClient>,
  registry: ChainRegistry,
  chainId: string | number,
): TClient | null {
  const chain = registry.getChain(chainId)
  if (!chain) {
    return null
  }
  const endpoint = chain.endpoints?.[0]
  if (!endpoint) {
    return null
  }
  return factory.createClient(endpoint, chain.chainId)
}

/**
 * Resolves a read-only client from a heterogeneous factory array.
 * For multi-VM loops where the chain type isn't known ahead of time.
 *
 * @expects chainId is registered in the registry
 * @postcondition returns a client, or null if chain/factory/endpoint not found
 */
export function resolveReadClient(
  factories: ReadClientFactory<unknown>[],
  registry: ChainRegistry,
  chainId: string | number,
): unknown | null {
  const chain = registry.getChain(chainId)
  if (!chain) {
    return null
  }
  const factory = factories.find((f) => f.chainType === chain.chainType)
  if (!factory) {
    return null
  }
  const endpoint = chain.endpoints?.[0]
  if (!endpoint) {
    return null
  }
  return factory.createClient(endpoint, chain.chainId)
}
