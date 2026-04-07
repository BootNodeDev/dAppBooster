import { describe, expect, it } from 'vitest'

import type { ChainDescriptor } from './descriptor'
import { getExplorerUrl } from './explorer'
import { createChainRegistry } from './registry'

const ethereum: ChainDescriptor = {
  caip2Id: 'eip155:1',
  chainId: 1,
  name: 'Ethereum',
  chainType: 'evm',
  nativeCurrency: { symbol: 'ETH', decimals: 18 },
  explorer: {
    name: 'Etherscan',
    url: 'https://etherscan.io',
    txPath: '/tx/{id}',
    addressPath: '/address/{id}',
    blockPath: '/block/{id}',
  },
  addressConfig: {
    format: 'hex',
    patterns: [/^0x[0-9a-fA-F]{40}$/],
  },
}

const solana: ChainDescriptor = {
  caip2Id: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  name: 'Solana',
  chainType: 'svm',
  nativeCurrency: { symbol: 'SOL', decimals: 9 },
  explorer: {
    url: 'https://explorer.solana.com',
    txPath: '/tx/{id}',
    addressPath: '/address/{id}',
    queryParams: { cluster: 'mainnet-beta' },
  },
  addressConfig: {
    format: 'base58',
    patterns: [/^[1-9A-HJ-NP-Za-km-z]{32,44}$/],
  },
}

const noExplorer: ChainDescriptor = {
  caip2Id: 'eip155:31337',
  chainId: 31337,
  name: 'Hardhat',
  chainType: 'evm',
  nativeCurrency: { symbol: 'ETH', decimals: 18 },
  addressConfig: {
    format: 'hex',
    patterns: [/^0x[0-9a-fA-F]{40}$/],
  },
}

const noBlockPath: ChainDescriptor = {
  caip2Id: 'eip155:11155111',
  chainId: 11155111,
  name: 'Sepolia',
  chainType: 'evm',
  nativeCurrency: { symbol: 'ETH', decimals: 18 },
  explorer: {
    url: 'https://sepolia.etherscan.io',
    txPath: '/tx/{id}',
    addressPath: '/address/{id}',
    // no blockPath
  },
  addressConfig: {
    format: 'hex',
    patterns: [/^0x[0-9a-fA-F]{40}$/],
  },
}

describe('getExplorerUrl', () => {
  const registry = createChainRegistry([ethereum, solana, noExplorer, noBlockPath])

  describe('tx URLs', () => {
    it('returns tx URL with {id} replaced', () => {
      const hash = '0xabc123def456'
      expect(getExplorerUrl(registry, { chainId: 1, tx: hash })).toBe(
        `https://etherscan.io/tx/${hash}`,
      )
    })

    it('returns tx URL for solana with queryParams appended', () => {
      const sig = 'SomeSolanaSignature123'
      expect(
        getExplorerUrl(registry, { chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', tx: sig }),
      ).toBe(`https://explorer.solana.com/tx/${sig}?cluster=mainnet-beta`)
    })
  })

  describe('address URLs', () => {
    it('returns address URL with {id} replaced', () => {
      const addr = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
      expect(getExplorerUrl(registry, { chainId: 1, address: addr })).toBe(
        `https://etherscan.io/address/${addr}`,
      )
    })

    it('appends queryParams to address URL', () => {
      const addr = 'So11111111111111111111111111111111111111112'
      expect(
        getExplorerUrl(registry, { chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', address: addr }),
      ).toBe(`https://explorer.solana.com/address/${addr}?cluster=mainnet-beta`)
    })
  })

  describe('block URLs', () => {
    it('returns block URL with {id} replaced for numeric block', () => {
      expect(getExplorerUrl(registry, { chainId: 1, block: 12345678 })).toBe(
        'https://etherscan.io/block/12345678',
      )
    })

    it('returns block URL with {id} replaced for string block', () => {
      expect(getExplorerUrl(registry, { chainId: 1, block: '12345678' })).toBe(
        'https://etherscan.io/block/12345678',
      )
    })
  })

  describe('null cases', () => {
    it('returns null when chain not found', () => {
      expect(getExplorerUrl(registry, { chainId: 999, tx: '0xabc' })).toBeNull()
    })

    it('returns null when chain has no explorer config', () => {
      expect(getExplorerUrl(registry, { chainId: 31337, tx: '0xabc' })).toBeNull()
    })

    it('returns null when block URL requested but no blockPath', () => {
      expect(getExplorerUrl(registry, { chainId: 11155111, block: 123 })).toBeNull()
    })
  })

  describe('queryParams', () => {
    it('appends multiple queryParams correctly', () => {
      const multiParamChain: ChainDescriptor = {
        caip2Id: 'eip155:1337',
        chainId: 1337,
        name: 'Test',
        chainType: 'evm',
        nativeCurrency: { symbol: 'ETH', decimals: 18 },
        explorer: {
          url: 'https://example.com',
          txPath: '/tx/{id}',
          addressPath: '/address/{id}',
          queryParams: { network: 'testnet', lang: 'en' },
        },
        addressConfig: { format: 'hex', patterns: [] },
      }
      const testRegistry = createChainRegistry([multiParamChain])
      const result = getExplorerUrl(testRegistry, { chainId: 1337, tx: '0xabc' })
      expect(result).toContain('network=testnet')
      expect(result).toContain('lang=en')
      expect(result).toMatch(/^https:\/\/example\.com\/tx\/0xabc\?/)
    })
  })
})
