import type { Chain } from 'viem'

import type { ChainDescriptor } from '../core/chain'

/**
 * Converts a viem Chain object into a ChainDescriptor for use in the dAppBooster adapter layer.
 */
export function fromViemChain(chain: Chain): ChainDescriptor {
  const explorer = chain.blockExplorers?.default
    ? {
        name: chain.blockExplorers.default.name,
        url: chain.blockExplorers.default.url,
        txPath: '/tx/{id}',
        addressPath: '/address/{id}',
        blockPath: '/block/{id}',
      }
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
    addressConfig: {
      format: 'hex',
      patterns: [/^0x[0-9a-fA-F]{40}$/],
      example: '0x0000000000000000000000000000000000000000',
    },
    testnet: chain.testnet ?? false,
  }
}
