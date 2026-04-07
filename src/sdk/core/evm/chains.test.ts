import { mainnet, sepolia } from 'viem/chains'
import { describe, expect, it } from 'vitest'

import { fromViemChain } from './chains'

describe('fromViemChain', () => {
  describe('chainId and caip2Id', () => {
    it('maps chain.id to chainId as a number', () => {
      const descriptor = fromViemChain(mainnet)
      expect(descriptor.chainId).toBe(1)
    })

    it('maps caip2Id as eip155:${id}', () => {
      const descriptor = fromViemChain(mainnet)
      expect(descriptor.caip2Id).toBe('eip155:1')
    })

    it('maps sepolia chain.id to chainId', () => {
      const descriptor = fromViemChain(sepolia)
      expect(descriptor.chainId).toBe(11155111)
    })

    it('maps sepolia caip2Id correctly', () => {
      const descriptor = fromViemChain(sepolia)
      expect(descriptor.caip2Id).toBe('eip155:11155111')
    })
  })

  describe('chainType', () => {
    it('sets chainType to "evm"', () => {
      const descriptor = fromViemChain(mainnet)
      expect(descriptor.chainType).toBe('evm')
    })
  })

  describe('name', () => {
    it('maps chain.name', () => {
      const descriptor = fromViemChain(mainnet)
      expect(descriptor.name).toBe('Ethereum')
    })
  })

  describe('nativeCurrency', () => {
    it('maps nativeCurrency symbol', () => {
      const descriptor = fromViemChain(mainnet)
      expect(descriptor.nativeCurrency.symbol).toBe('ETH')
    })

    it('maps nativeCurrency decimals', () => {
      const descriptor = fromViemChain(mainnet)
      expect(descriptor.nativeCurrency.decimals).toBe(18)
    })

    it('maps nativeCurrency name', () => {
      const descriptor = fromViemChain(mainnet)
      expect(descriptor.nativeCurrency.name).toBe('Ether')
    })

    it('maps sepolia nativeCurrency name', () => {
      const descriptor = fromViemChain(sepolia)
      expect(descriptor.nativeCurrency.name).toBe('Sepolia Ether')
    })
  })

  describe('explorer', () => {
    it('sets explorer txPath to "/tx/{id}" when blockExplorers exist', () => {
      const descriptor = fromViemChain(mainnet)
      expect(descriptor.explorer?.txPath).toBe('/tx/{id}')
    })

    it('sets explorer addressPath to "/address/{id}" when blockExplorers exist', () => {
      const descriptor = fromViemChain(mainnet)
      expect(descriptor.explorer?.addressPath).toBe('/address/{id}')
    })

    it('sets explorer blockPath to "/block/{id}" when blockExplorers exist', () => {
      const descriptor = fromViemChain(mainnet)
      expect(descriptor.explorer?.blockPath).toBe('/block/{id}')
    })

    it('sets explorer name from chain.blockExplorers.default.name', () => {
      const descriptor = fromViemChain(mainnet)
      expect(descriptor.explorer?.name).toBe('Etherscan')
    })

    it('sets explorer url from chain.blockExplorers.default.url', () => {
      const descriptor = fromViemChain(mainnet)
      expect(descriptor.explorer?.url).toBe('https://etherscan.io')
    })

    it('sets sepolia explorer url correctly', () => {
      const descriptor = fromViemChain(sepolia)
      expect(descriptor.explorer?.url).toBe('https://sepolia.etherscan.io')
    })

    it('returns undefined for explorer when chain has no blockExplorers', () => {
      const chainWithoutExplorers = {
        ...mainnet,
        blockExplorers: undefined,
      }
      const descriptor = fromViemChain(chainWithoutExplorers)
      expect(descriptor.explorer).toBeUndefined()
    })
  })

  describe('addressConfig', () => {
    it('sets addressConfig.format to "hex"', () => {
      const descriptor = fromViemChain(mainnet)
      expect(descriptor.addressConfig.format).toBe('hex')
    })

    it('sets addressConfig.patterns to match EVM addresses', () => {
      const descriptor = fromViemChain(mainnet)
      expect(descriptor.addressConfig.patterns).toHaveLength(1)
      expect(
        descriptor.addressConfig.patterns[0].test('0x0000000000000000000000000000000000000000'),
      ).toBe(true)
      expect(descriptor.addressConfig.patterns[0].test('not-an-address')).toBe(false)
    })

    it('sets addressConfig.example to zero address', () => {
      const descriptor = fromViemChain(mainnet)
      expect(descriptor.addressConfig.example).toBe('0x0000000000000000000000000000000000000000')
    })
  })

  describe('testnet', () => {
    it('sets testnet to false when not specified', () => {
      const descriptor = fromViemChain(mainnet)
      expect(descriptor.testnet).toBe(false)
    })

    it('sets testnet to true when chain.testnet is true', () => {
      const descriptor = fromViemChain(sepolia)
      expect(descriptor.testnet).toBe(true)
    })
  })
})
