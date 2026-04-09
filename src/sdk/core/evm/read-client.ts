import { createPublicClient, http, type PublicClient } from 'viem'

import type { ReadClientFactory } from '../adapters/provider'
import type { EndpointConfig } from '../chain/descriptor'

/**
 * Read-only client factory for EVM chains. Wraps viem's createPublicClient.
 *
 * @expects endpoint.url is a valid JSON-RPC URL
 * @postcondition returns a viem PublicClient for read-only chain queries
 */
export const evmReadClientFactory: ReadClientFactory<PublicClient> = {
  chainType: 'evm',
  createClient(endpoint: EndpointConfig, _chainId: string | number): PublicClient {
    return createPublicClient({ transport: http(endpoint.url) })
  },
}
