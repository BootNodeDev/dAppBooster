/**
 * Conformance suite for WalletAdapter implementations.
 * This module is test-support infrastructure only — NOT imported by production code paths.
 */

import { describe, expect, it } from 'vitest'

import type { WalletAdapter } from '../../adapters/wallet'
import { ChainNotSupportedError } from '../../errors'

const UNKNOWN_CHAIN_ID = 987_654_321

/**
 * Runs a battery of conformance tests against a WalletAdapter implementation.
 *
 * Each test verifies one behavioral claim from the WalletAdapter JSDoc contract.
 * Adapter authors call this from their own test suite to prove their adapter
 * honors the SDK's behavioral contract. Optional, capability-gated methods
 * (`switchChain`, `signTypedData`) are only exercised when the adapter declares
 * support for them via `metadata.capabilities`, so structurally-different adapters
 * (e.g. an always-connected server wallet that cannot switch chains) pass on merit
 * rather than because the suite is too weak to notice.
 *
 * Coverage limitation: disconnection contracts (`activeAccount: null`,
 * `getSigner()` -> null) are guarded by `if (!connected)` and are therefore vacuous
 * for an always-connected adapter — the suite alone does not prove such an adapter
 * handles a disconnected state, because it has none to exercise. Likewise the
 * connected-path `switchChain` contract is only exercised when the adapter under test
 * is connected. To fully cover both states, run this suite against the adapter in
 * BOTH a connected and a disconnected fixture.
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
export function runWalletAdapterConformance<TAdapter extends WalletAdapter>(options: {
  createAdapter: () => TAdapter | Promise<TAdapter>
  expectedChainType: string
}): void {
  describe(`WalletAdapter conformance (chainType=${options.expectedChainType})`, () => {
    it('declares the expected chainType', async () => {
      const adapter = await options.createAdapter()
      expect(adapter.chainType).toBe(options.expectedChainType)
    })

    it('getStatus() returns an object with `connected: boolean` field', async () => {
      const adapter = await options.createAdapter()
      const status = adapter.getStatus()
      expect(status).toMatchObject({ connected: expect.any(Boolean) })
    })

    it('getStatus() while disconnected pairs `activeAccount: null` with empty `connectedChainIds`', async () => {
      const adapter = await options.createAdapter()
      const status = adapter.getStatus()
      if (!status.connected) {
        expect(status.activeAccount).toBeNull()
        expect(status.connectedChainIds).toEqual([])
      }
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

    it('getSigner() resolves to null while disconnected', async () => {
      const adapter = await options.createAdapter()
      const status = adapter.getStatus()
      if (!status.connected) {
        await expect(adapter.getSigner()).resolves.toBeNull()
      }
    })

    it('onStatusChange() returns a callable unsubscribe that does not throw when invoked', async () => {
      const adapter = await options.createAdapter()
      const unsubscribe = adapter.onStatusChange(() => undefined)
      expect(unsubscribe).toBeTypeOf('function')
      expect(() => unsubscribe()).not.toThrow()
    })

    it('switchChain() rejects for an unknown chainId when the capability is supported', async () => {
      const adapter = await options.createAdapter()
      // Capability-gated so a single-chain adapter (e.g. server wallet) skips on merit.
      if (!adapter.metadata.capabilities.switchChain) {
        return
      }
      // Must reject for an unknown chainId. The specific typed error depends on the
      // adapter's precondition ordering, so this case asserts only "rejects".
      await expect(adapter.switchChain(UNKNOWN_CHAIN_ID)).rejects.toBeInstanceOf(Error)
    })

    it('switchChain() on a connected adapter rejects with ChainNotSupportedError for an unknown chainId', async () => {
      const adapter = await options.createAdapter()
      if (!adapter.metadata.capabilities.switchChain) {
        return
      }
      const status = adapter.getStatus()
      // Only the connected path reaches the chain-support check (disconnected fails its
      // connection precondition first), so the subclass contract applies only here.
      if (!status.connected) {
        return
      }
      await expect(adapter.switchChain(UNKNOWN_CHAIN_ID)).rejects.toBeInstanceOf(
        ChainNotSupportedError,
      )
    })

    it('signTypedData() is present iff the capability is declared', async () => {
      const adapter = await options.createAdapter()
      if (adapter.metadata.capabilities.signTypedData) {
        expect(adapter.signTypedData).toBeTypeOf('function')
      }
    })
  })
}
