/**
 * Conformance suite for TransactionAdapter implementations.
 * This module is test-support infrastructure only — NOT imported by production code paths.
 */

import { describe, expect, it } from 'vitest'

import type { TransactionAdapter } from '../../adapters/transaction'

/**
 * Runs a battery of conformance tests against a TransactionAdapter implementation.
 *
 * @expects createAdapter returns a freshly initialized adapter on each call
 * @expects expectedChainType matches the adapter's declared chainType
 */
export function runTransactionAdapterConformance<TAdapter extends TransactionAdapter>(opts: {
  createAdapter: () => TAdapter | Promise<TAdapter>
  expectedChainType: string
}): void {
  describe(`TransactionAdapter conformance (chainType=${opts.expectedChainType})`, () => {
    it('declares the expected chainType', async () => {
      const adapter = await opts.createAdapter()
      expect(adapter.chainType).toBe(opts.expectedChainType)
    })

    it('supportedChains is a non-empty array', async () => {
      const adapter = await opts.createAdapter()
      expect(Array.isArray(adapter.supportedChains)).toBe(true)
      expect(adapter.supportedChains.length).toBeGreaterThan(0)
    })

    it('every supportedChains entry has matching chainType', async () => {
      const adapter = await opts.createAdapter()
      for (const chain of adapter.supportedChains) {
        expect(chain.chainType).toBe(opts.expectedChainType)
      }
    })
  })
}
