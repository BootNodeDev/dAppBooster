/**
 * Conformance suite for TransactionAdapter implementations.
 * This module is test-support infrastructure only — NOT imported by production code paths.
 */

import { describe, expect, it } from 'vitest'

import type { TransactionAdapter, TransactionRef } from '../../adapters/transaction'

const UNKNOWN_CHAIN_ID = 987_654_321

/**
 * Runs a battery of conformance tests against a TransactionAdapter implementation.
 *
 * Asserts the chain-agnostic guarantees every TransactionAdapter must honor:
 * a stable chainType, a non-empty supportedChains list whose entries match that
 * chainType, declared metadata, and the refusal to operate on a chain it does not
 * support. Adapter authors call this from their own test suite to prove their
 * adapter honors the SDK's behavioral contract.
 *
 * @example
 * ```ts
 * // In evm-adapter/transaction.test.ts
 * runTransactionAdapterConformance({
 *   createAdapter: () => createEvmTransactionAdapter({ ... }),
 *   expectedChainType: 'evm',
 * })
 * ```
 *
 * @expects createAdapter returns a freshly initialized adapter on each call
 * @expects expectedChainType matches the adapter's declared chainType
 */
export function runTransactionAdapterConformance<TAdapter extends TransactionAdapter>(options: {
  createAdapter: () => TAdapter | Promise<TAdapter>
  expectedChainType: string
}): void {
  describe(`TransactionAdapter conformance (chainType=${options.expectedChainType})`, () => {
    it('declares the expected chainType', async () => {
      const adapter = await options.createAdapter()
      expect(adapter.chainType).toBe(options.expectedChainType)
    })

    it('metadata declares the expected chainType', async () => {
      const adapter = await options.createAdapter()
      expect(adapter.metadata.chainType).toBe(options.expectedChainType)
    })

    it('supportedChains is a non-empty array', async () => {
      const adapter = await options.createAdapter()
      expect(Array.isArray(adapter.supportedChains)).toBe(true)
      expect(adapter.supportedChains.length).toBeGreaterThan(0)
    })

    it('every supportedChains entry has matching chainType', async () => {
      const adapter = await options.createAdapter()
      for (const chain of adapter.supportedChains) {
        expect(chain.chainType).toBe(options.expectedChainType)
      }
    })

    it('confirm() rejects for a ref on a chain the adapter does not support', async () => {
      const adapter = await options.createAdapter()
      // Must reject, not silently confirm, on a chain the adapter never configured.
      const unsupportedRef: TransactionRef = {
        chainType: options.expectedChainType,
        id: 'conformance-unknown-chain',
        chainId: UNKNOWN_CHAIN_ID,
      }
      await expect(adapter.confirm(unsupportedRef)).rejects.toBeInstanceOf(Error)
    })
  })
}
