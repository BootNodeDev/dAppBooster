import type { Chain } from 'viem'

import type { ChainDescriptor } from '../core/chain'

/**
 * Converts a viem Chain object into a ChainDescriptor for use in the dAppBooster adapter layer.
 *
 * The optional `rpcUrl` populates the descriptor's `endpoints` array — required for any
 * consumer that uses `useReadOnly` / `useEvmReadOnly` to build a public client from the
 * registered chain set. When omitted, falls back to the chain's first default RPC URL from
 * viem (`chain.rpcUrls.default.http[0]`). The fallback guarantees descriptors always carry
 * at least one endpoint; consumers that need a specific RPC (e.g. their own Alchemy/Infura
 * key) must pass it explicitly.
 *
 * @expects chain is a well-formed viem Chain (id, name, nativeCurrency present)
 * @postcondition returns a ChainDescriptor with chainType = 'evm', caip2Id = `eip155:{id}`, and hex address config
 * @postcondition explorer is populated when chain.blockExplorers.default exists, otherwise undefined
 * @postcondition endpoints contains at least one entry — either the supplied rpcUrl or the chain's default
 */
export function fromViemChain(chain: Chain, rpcUrl?: string): ChainDescriptor {
  const explorer = chain.blockExplorers?.default
    ? {
        name: chain.blockExplorers.default.name,
        url: chain.blockExplorers.default.url,
        txPath: '/tx/{id}',
        addressPath: '/address/{id}',
        blockPath: '/block/{id}',
      }
    : undefined

  const resolvedRpcUrl = rpcUrl ?? chain.rpcUrls.default.http[0]
  const endpoints = resolvedRpcUrl
    ? [{ url: resolvedRpcUrl, protocol: 'json-rpc' as const, purpose: 'default' as const }]
    : undefined

  return {
    caip2Id: `eip155:${chain.id}`,
    chainId: chain.id,
    name: chain.name,
    chainType: 'evm',
    nativeCurrency: {
      symbol: chain.nativeCurrency.symbol,
      decimals: chain.nativeCurrency.decimals,
      name: chain.nativeCurrency.name,
    },
    explorer,
    endpoints,
    addressConfig: {
      format: 'hex',
      patterns: [/^0x[0-9a-fA-F]{40}$/],
      example: '0x0000000000000000000000000000000000000000',
    },
    testnet: chain.testnet ?? false,
  }
}
