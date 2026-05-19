/**
 * Conformance suite for WalletAdapter implementations.
 * This module is test-support infrastructure only — NOT imported by production code paths.
 */

import { describe, expect, it } from 'vitest'

import type { WalletAdapter } from '../../adapters/wallet'

/**
 * Runs a battery of conformance tests against a WalletAdapter implementation.
 *
 * Each test verifies one behavioral claim from the WalletAdapter JSDoc contract.
 * Adapter authors call this from their own test suite to prove their adapter
 * honors the SDK's behavioral contract.
 *
 * @example
 * ```ts
 * // In evm-adapter/wagmi/wallet.test.ts
 * runWalletAdapterConformance({
 *   createAdapter: () => createEvmWalletAdapter({ ... }),
 *   expectedChainType: 'evm',
 * })
 * ```
 *
 * @expects createAdapter returns a freshly initialized adapter on each call
 * @expects expectedChainType matches the adapter's declared chainType
 */
export function runWalletAdapterConformance<TAdapter extends WalletAdapter>(opts: {
  createAdapter: () => TAdapter | Promise<TAdapter>
  expectedChainType: string
}): void {
  describe(`WalletAdapter conformance (chainType=${opts.expectedChainType})`, () => {
    it('declares the expected chainType', async () => {
      const adapter = await opts.createAdapter()
      expect(adapter.chainType).toBe(opts.expectedChainType)
    })

    it('getStatus() returns an object with `connected: boolean` field', async () => {
      const adapter = await opts.createAdapter()
      const status = await adapter.getStatus()
      expect(status).toMatchObject({ connected: expect.any(Boolean) })
    })

    it('getStatus() with connected: false has empty connectedChainIds', async () => {
      const adapter = await opts.createAdapter()
      const status = await adapter.getStatus()
      if (!status.connected) {
        expect(status.connectedChainIds).toEqual([])
      }
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
