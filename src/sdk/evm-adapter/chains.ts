import type { Chain } from 'viem'

import type { ChainDescriptor } from '../core/chain'

/**
 * Converts a viem Chain object into a ChainDescriptor for use in the dAppBooster adapter layer.
 *
 * @expects chain is a well-formed viem Chain (id, name, nativeCurrency present)
 * @postcondition returns a ChainDescriptor with chainType = 'evm', caip2Id = `eip155:{id}`, and hex address config
 * @postcondition explorer is populated when chain.blockExplorers.default exists, otherwise undefined
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
