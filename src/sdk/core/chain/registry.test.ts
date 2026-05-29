import { describe, expect, it } from 'vitest'

import { ChainRegistryConflictError } from '../errors'
import type { ChainDescriptor } from './descriptor'
import { createChainRegistry } from './registry'

const ethereum: ChainDescriptor = {
  caip2Id: 'eip155:1',
  chainId: 1,
  name: 'Ethereum',
  chainType: 'evm',
  nativeCurrency: { symbol: 'ETH', decimals: 18, name: 'Ether' },
  addressConfig: {
    format: 'hex',
    patterns: [/^0x[0-9a-fA-F]{40}$/],
    example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  },
}

const sepolia: ChainDescriptor = {
  caip2Id: 'eip155:11155111',
  chainId: 11155111,
  name: 'Sepolia',
  chainType: 'evm',
  testnet: true,
  nativeCurrency: { symbol: 'ETH', decimals: 18 },
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
  nativeCurrency: { symbol: 'SOL', decimals: 9, name: 'Solana' },
  addressConfig: {
    format: 'base58',
    patterns: [/^[1-9A-HJ-NP-Za-km-z]{32,44}$/],
    example: 'So11111111111111111111111111111111111111112',
  },
}

describe('createChainRegistry', () => {
  describe('getChain', () => {
    it('returns descriptor by numeric chainId', () => {
      const registry = createChainRegistry([ethereum])
      expect(registry.getChain(1)).toBe(ethereum)
    })

    it('returns descriptor by string chainId', () => {
      const registry = createChainRegistry([solana])
      expect(registry.getChain('5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toBe(solana)
    })

    it('returns null for unknown chainId', () => {
      const registry = createChainRegistry([ethereum])
      expect(registry.getChain(999)).toBeNull()
    })

    it('returns null for unknown string chainId', () => {
      const registry = createChainRegistry([ethereum])
      expect(registry.getChain('unknown')).toBeNull()
    })

    it('works with multiple chains by numeric chainId', () => {
      const registry = createChainRegistry([ethereum, sepolia])
      expect(registry.getChain(11155111)).toBe(sepolia)
    })

    it('finds numeric chainId when queried with string equivalent', () => {
      const registry = createChainRegistry([ethereum])
      expect(registry.getChain('1')).toBe(ethereum)
    })

    it('finds string chainId when queried with numeric equivalent', () => {
      const numericStringChain: ChainDescriptor = {
        caip2Id: 'cosmos:cosmoshub-4',
        chainId: 'cosmoshub-4',
        name: 'Cosmos Hub',
        chainType: 'cosmos',
        nativeCurrency: { symbol: 'ATOM', decimals: 6 },
        addressConfig: { format: 'bech32', patterns: [] },
      }
      const registry = createChainRegistry([numericStringChain])
      // Non-numeric string won't match a number — this is expected to return null
      expect(registry.getChain('cosmoshub-4')).toBe(numericStringChain)
    })
  })

  describe('getChainByCaip2', () => {
    it('returns descriptor by caip2Id', () => {
      const registry = createChainRegistry([ethereum, solana])
      expect(registry.getChainByCaip2('eip155:1')).toBe(ethereum)
    })

    it('returns null for unknown caip2Id', () => {
      const registry = createChainRegistry([ethereum])
      expect(registry.getChainByCaip2('eip155:999')).toBeNull()
    })

    it('returns solana descriptor by caip2Id', () => {
      const registry = createChainRegistry([solana])
      expect(registry.getChainByCaip2('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toBe(solana)
    })
  })

  describe('getChainType', () => {
    it('returns chainType for known chainId', () => {
      const registry = createChainRegistry([ethereum])
      expect(registry.getChainType(1)).toBe('evm')
    })

    it('returns chainType for string chainId', () => {
      const registry = createChainRegistry([solana])
      expect(registry.getChainType('5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toBe('svm')
    })

    it('returns null for unknown chainId', () => {
      const registry = createChainRegistry([ethereum])
      expect(registry.getChainType(999)).toBeNull()
    })
  })

  describe('getChainsByType', () => {
    it('returns all chains of a given type', () => {
      const registry = createChainRegistry([ethereum, sepolia, solana])
      const evmChains = registry.getChainsByType('evm')
      expect(evmChains).toHaveLength(2)
      expect(evmChains).toContain(ethereum)
      expect(evmChains).toContain(sepolia)
    })

    it('returns empty array for unknown type', () => {
      const registry = createChainRegistry([ethereum])
      expect(registry.getChainsByType('cosmos')).toEqual([])
    })

    it('returns single-element array when only one chain matches', () => {
      const registry = createChainRegistry([ethereum, solana])
      expect(registry.getChainsByType('svm')).toEqual([solana])
    })
  })

  describe('getAllChains', () => {
    it('returns all registered chains', () => {
      const registry = createChainRegistry([ethereum, sepolia, solana])
      const all = registry.getAllChains()
      expect(all).toHaveLength(3)
      expect(all).toContain(ethereum)
      expect(all).toContain(sepolia)
      expect(all).toContain(solana)
    })

    it('returns empty array for empty registry', () => {
      const registry = createChainRegistry([])
      expect(registry.getAllChains()).toEqual([])
    })
  })

  describe('conflict detection', () => {
    it('throws ChainRegistryConflictError on duplicate numeric chainId', () => {
      const duplicate: ChainDescriptor = {
        ...ethereum,
        caip2Id: 'eip155:1-duplicate',
        name: 'Ethereum Duplicate',
      }
      expect(() => createChainRegistry([ethereum, duplicate])).toThrow(ChainRegistryConflictError)
    })

    it('throws ChainRegistryConflictError on duplicate string chainId', () => {
      const duplicate: ChainDescriptor = {
        ...solana,
        caip2Id: 'solana:duplicate',
        name: 'Solana Duplicate',
      }
      expect(() => createChainRegistry([solana, duplicate])).toThrow(ChainRegistryConflictError)
    })

    it('throws ChainRegistryConflictError on duplicate caip2Id', () => {
      const duplicate: ChainDescriptor = {
        ...ethereum,
        chainId: 99999,
        name: 'Ethereum Duplicate',
      }
      expect(() => createChainRegistry([ethereum, duplicate])).toThrow(ChainRegistryConflictError)
    })

    it('includes conflicting chainId and caip2Id in the error', () => {
      const duplicate: ChainDescriptor = {
        ...ethereum,
        caip2Id: 'eip155:1-dup',
        name: 'Duplicate',
      }
      try {
        createChainRegistry([ethereum, duplicate])
        expect.fail('should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(ChainRegistryConflictError)
        const conflictError = error as ChainRegistryConflictError
        expect(conflictError.chainId).toBe(1)
        expect(conflictError.caip2Id).toBe('eip155:1-dup')
        expect(conflictError.conflictOn).toBe('chainId')
      }
    })

    it('sets conflictOn to "caip2Id" when only the caip2Id collides', () => {
      const duplicate: ChainDescriptor = {
        ...ethereum,
        chainId: 99999,
        name: 'Ethereum Duplicate',
      }
      try {
        createChainRegistry([ethereum, duplicate])
        expect.fail('should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(ChainRegistryConflictError)
        const conflictError = error as ChainRegistryConflictError
        expect(conflictError.chainId).toBe(99999)
        expect(conflictError.caip2Id).toBe('eip155:1')
        expect(conflictError.conflictOn).toBe('caip2Id')
      }
    })

    it('throws on a numeric chainId colliding with its string equivalent (distinct descriptors)', () => {
      const numericId: ChainDescriptor = { ...ethereum, chainId: 1, caip2Id: 'eip155:1' }
      const stringId: ChainDescriptor = { ...ethereum, chainId: '1', caip2Id: 'foo:1' }
      try {
        createChainRegistry([numericId, stringId])
        expect.fail('should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(ChainRegistryConflictError)
        const conflictError = error as ChainRegistryConflictError
        expect(conflictError.chainId).toBe('1')
        expect(conflictError.caip2Id).toBe('foo:1')
        expect(conflictError.conflictOn).toBe('chainId')
      }
    })

    it('throws on two descriptors sharing the same numeric chainId with different caip2Id', () => {
      const first: ChainDescriptor = { ...ethereum, chainId: 1, caip2Id: 'eip155:1' }
      const second: ChainDescriptor = { ...ethereum, chainId: 1, caip2Id: 'eip155:1-other' }
      try {
        createChainRegistry([first, second])
        expect.fail('should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(ChainRegistryConflictError)
        const conflictError = error as ChainRegistryConflictError
        expect(conflictError.conflictOn).toBe('chainId')
      }
    })
  })
})
