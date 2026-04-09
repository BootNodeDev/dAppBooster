import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { TransactionLifecycle } from '../../core/adapters/lifecycle'
import type {
  PreStep,
  TransactionAdapter,
  TransactionParams,
} from '../../core/adapters/transaction'
import type { WalletAdapter } from '../../core/adapters/wallet'
import {
  AdapterNotFoundError,
  PreStepsNotExecutedError,
  TransactionNotReadyError,
} from '../../core/errors'
import { DAppBoosterProvider } from '../provider/DAppBoosterProvider'
import { useTransaction } from './useTransaction'

vi.mock('@/src/wallet/providers', () => ({
  Web3Provider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

const mockSigner = {}

const mockChain = {
  caip2Id: 'eip155:1',
  chainId: 1,
  name: 'Ethereum',
  chainType: 'evm',
  nativeCurrency: { symbol: 'ETH', decimals: 18 },
  addressConfig: { format: 'hex' as const, patterns: [], example: '0x...' },
}

const makeMockTxAdapter = (overrides?: Partial<TransactionAdapter>): TransactionAdapter => ({
  chainType: 'evm',
  supportedChains: [mockChain],
  metadata: { chainType: 'evm', feeModel: 'eip1559', confirmationModel: 'blockConfirmations' },
  prepare: vi.fn(async () => ({ ready: true })),
  execute: vi.fn(async () => ({ chainType: 'evm', id: '0xhash', chainId: 1 })),
  confirm: vi.fn(async () => ({
    status: 'success' as const,
    ref: { chainType: 'evm', id: '0xhash', chainId: 1 },
    receipt: {},
  })),
  ...overrides,
})

const makeMockWalletAdapter = (): WalletAdapter =>
  ({
    chainType: 'evm',
    supportedChains: [mockChain],
    metadata: {
      chainType: 'evm',
      capabilities: { signTypedData: false, switchChain: false },
      formatAddress: (a: string) => a,
      availableWallets: () => [],
    },
    connect: vi.fn(),
    reconnect: vi.fn(),
    disconnect: vi.fn(),
    getStatus: vi.fn(() => ({
      connected: true,
      activeAccount: '0xabc',
      connectedChainIds: [1],
      connecting: false,
    })),
    onStatusChange: vi.fn(() => vi.fn()),
    signMessage: vi.fn(),
    getSigner: vi.fn(async () => mockSigner),
    switchChain: vi.fn(),
  }) as unknown as WalletAdapter

const makeWrapper = (
  config: {
    txAdapter?: TransactionAdapter
    walletAdapter?: WalletAdapter
    lifecycle?: TransactionLifecycle
  } = {},
) => {
  const txAdapter = config.txAdapter ?? makeMockTxAdapter()
  const walletAdapter = config.walletAdapter ?? makeMockWalletAdapter()
  return ({ children }: { children: ReactNode }) => (
    <DAppBoosterProvider
      config={{
        wallets: { evm: { adapter: walletAdapter } },
        transactions: { evm: txAdapter },
        lifecycle: config.lifecycle,
      }}
    >
      {children}
    </DAppBoosterProvider>
  )
}

const testParams: TransactionParams = { chainId: 1, payload: { to: '0x1234', value: '0' } }

describe('useTransaction', () => {
  it('starts in idle phase', () => {
    const { result } = renderHook(() => useTransaction(), { wrapper: makeWrapper() })
    expect(result.current.phase).toBe('idle')
  })

  it('has null initial state', () => {
    const { result } = renderHook(() => useTransaction(), { wrapper: makeWrapper() })
    expect(result.current.prepareResult).toBeNull()
    expect(result.current.ref).toBeNull()
    expect(result.current.result).toBeNull()
    expect(result.current.preStepResults).toEqual([])
    expect(result.current.explorerUrl).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('transitions through prepare → submit → confirm → idle on successful execute', async () => {
    const phases: string[] = []

    const txAdapter = makeMockTxAdapter({
      prepare: vi.fn(async () => {
        phases.push('during-prepare')
        return { ready: true }
      }),
      execute: vi.fn(async () => {
        phases.push('during-execute')
        return { chainType: 'evm', id: '0xhash', chainId: 1 }
      }),
      confirm: vi.fn(async () => {
        phases.push('during-confirm')
        return {
          status: 'success' as const,
          ref: { chainType: 'evm', id: '0xhash', chainId: 1 },
          receipt: {},
        }
      }),
    })

    const { result } = renderHook(() => useTransaction(), { wrapper: makeWrapper({ txAdapter }) })

    await act(async () => {
      await result.current.execute(testParams)
    })

    expect(result.current.phase).toBe('idle')
    expect(result.current.result?.status).toBe('success')
    expect(phases).toEqual(['during-prepare', 'during-execute', 'during-confirm'])
  })

  it('returns the result from confirm', async () => {
    const { result } = renderHook(() => useTransaction(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.execute(testParams)
    })

    expect(result.current.result?.status).toBe('success')
  })

  it('sets ref after execute succeeds', async () => {
    const { result } = renderHook(() => useTransaction(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.execute(testParams)
    })

    expect(result.current.ref?.id).toBe('0xhash')
  })

  it('throws TransactionNotReadyError when prepare returns ready: false', async () => {
    const txAdapter = makeMockTxAdapter({
      prepare: vi.fn(async () => ({ ready: false, reason: 'Insufficient gas' })),
    })

    const { result } = renderHook(() => useTransaction(), { wrapper: makeWrapper({ txAdapter }) })

    let caught: unknown
    await act(async () => {
      try {
        await result.current.execute(testParams)
      } catch (error) {
        caught = error
      }
    })

    expect(caught).toBeInstanceOf(TransactionNotReadyError)
    expect(result.current.error).toBeInstanceOf(TransactionNotReadyError)
    expect(result.current.error?.message).toContain('Insufficient gas')
  })

  it('throws PreStepsNotExecutedError when autoPreSteps is false and params has preSteps', async () => {
    const preStep: PreStep = { label: 'Approve', params: { chainId: 1, payload: {} } }
    const { result } = renderHook(() => useTransaction({ autoPreSteps: false }), {
      wrapper: makeWrapper(),
    })

    await expect(
      act(async () => {
        await result.current.execute({ ...testParams, preSteps: [preStep] })
      }),
    ).rejects.toThrow(PreStepsNotExecutedError)
  })

  it('auto-executes preSteps when autoPreSteps is true (default)', async () => {
    const txAdapter = makeMockTxAdapter()
    const preStep: PreStep = { label: 'Approve', params: { chainId: 1, payload: {} } }

    const { result } = renderHook(() => useTransaction(), { wrapper: makeWrapper({ txAdapter }) })

    await act(async () => {
      await result.current.execute({ ...testParams, preSteps: [preStep] })
    })

    // execute called twice: once for preStep, once for main tx
    expect(txAdapter.execute).toHaveBeenCalledTimes(2)
    expect(result.current.preStepResults).toHaveLength(1)
  })

  it('sets error and resets to idle phase when execute throws', async () => {
    const txAdapter = makeMockTxAdapter({
      prepare: vi.fn(async () => {
        throw new Error('prepare failed')
      }),
    })

    const { result } = renderHook(() => useTransaction(), { wrapper: makeWrapper({ txAdapter }) })

    await act(async () => {
      try {
        await result.current.execute(testParams)
      } catch {
        // expected to throw
      }
    })

    expect(result.current.phase).toBe('idle')
    expect(result.current.error?.message).toBe('prepare failed')
  })

  it('calls global lifecycle.onSubmit then per-operation lifecycle.onSubmit in order', async () => {
    const globalOnSubmit = vi.fn()
    const localOnSubmit = vi.fn()

    const { result } = renderHook(
      () => useTransaction({ lifecycle: { onSubmit: localOnSubmit } }),
      { wrapper: makeWrapper({ lifecycle: { onSubmit: globalOnSubmit } }) },
    )

    await act(async () => {
      await result.current.execute(testParams)
    })

    expect(globalOnSubmit).toHaveBeenCalledOnce()
    expect(localOnSubmit).toHaveBeenCalledOnce()
    expect(globalOnSubmit.mock.invocationCallOrder[0]).toBeLessThan(
      localOnSubmit.mock.invocationCallOrder[0],
    )
  })

  it('reset() clears all state', async () => {
    const { result } = renderHook(() => useTransaction(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.execute(testParams)
    })

    expect(result.current.result).not.toBeNull()

    act(() => {
      result.current.reset()
    })

    expect(result.current.phase).toBe('idle')
    expect(result.current.prepareResult).toBeNull()
    expect(result.current.ref).toBeNull()
    expect(result.current.result).toBeNull()
    expect(result.current.preStepResults).toEqual([])
    expect(result.current.explorerUrl).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('explorerUrl is null when no ref', () => {
    const { result } = renderHook(() => useTransaction(), { wrapper: makeWrapper() })
    expect(result.current.explorerUrl).toBeNull()
  })

  it('explorerUrl is null when chain has no explorer config', async () => {
    // mockChain has no explorer config, so getExplorerUrl returns null
    const { result } = renderHook(() => useTransaction(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.execute(testParams)
    })

    // ref is set but chain has no explorer — explorerUrl should be null
    expect(result.current.ref).not.toBeNull()
    expect(result.current.explorerUrl).toBeNull()
  })

  it('does not abort the transaction when a lifecycle hook throws', async () => {
    const throwingOnSubmit = vi.fn(() => {
      throw new Error('lifecycle error')
    })
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(
      () => useTransaction({ lifecycle: { onSubmit: throwingOnSubmit } }),
      { wrapper: makeWrapper() },
    )

    await act(async () => {
      await result.current.execute(testParams)
    })
    consoleError.mockRestore()

    // Transaction should complete successfully despite the lifecycle hook throwing
    expect(result.current.result?.status).toBe('success')
    expect(result.current.error).toBeNull()
  })

  it('fires onReplace lifecycle hook when confirm returns a replaced transaction', async () => {
    const originalRef = { chainType: 'evm', id: '0xoriginal', chainId: 1 }
    const replacedRef = { chainType: 'evm', id: '0xreplaced', chainId: 1 }
    const globalOnReplace = vi.fn()

    const txAdapter = makeMockTxAdapter({
      execute: vi.fn(async () => originalRef),
      confirm: vi.fn(async () => ({
        status: 'success' as const,
        ref: replacedRef,
        receipt: {},
      })),
    })

    const { result } = renderHook(() => useTransaction(), {
      wrapper: makeWrapper({ txAdapter, lifecycle: { onReplace: globalOnReplace } }),
    })

    await act(async () => {
      await result.current.execute(testParams)
    })

    expect(globalOnReplace).toHaveBeenCalledOnce()
    expect(globalOnReplace).toHaveBeenCalledWith(originalRef, replacedRef, 'replaced')
  })

  it('fires onError lifecycle hook when an error occurs', async () => {
    const globalOnError = vi.fn()
    const txAdapter = makeMockTxAdapter({
      prepare: vi.fn(async () => {
        throw new Error('tx failed')
      }),
    })

    const { result } = renderHook(() => useTransaction(), {
      wrapper: makeWrapper({ txAdapter, lifecycle: { onError: globalOnError } }),
    })

    await act(async () => {
      try {
        await result.current.execute(testParams)
      } catch {
        // expected
      }
    })

    expect(globalOnError).toHaveBeenCalledWith('prepare', expect.any(Error))
  })

  describe('manual pre-step control', () => {
    const preStep1: PreStep = {
      label: 'Approve USDC',
      params: { chainId: 1, payload: { type: 'approve-1' } },
    }
    const preStep2: PreStep = {
      label: 'Approve WETH',
      params: { chainId: 1, payload: { type: 'approve-2' } },
    }

    it('prepare() stores the prepare result and transitions to prepare phase', async () => {
      const txAdapter = makeMockTxAdapter({
        prepare: vi.fn(async () => ({ ready: true })),
      })

      const { result } = renderHook(() => useTransaction({ autoPreSteps: false }), {
        wrapper: makeWrapper({ txAdapter }),
      })

      await act(async () => {
        const prepared = await result.current.prepare({
          ...testParams,
          preSteps: [preStep1],
        })
        expect(prepared.ready).toBe(true)
      })

      expect(result.current.prepareResult).toEqual({ ready: true })
    })

    it('prepare() throws TransactionNotReadyError when prepare returns ready: false', async () => {
      const txAdapter = makeMockTxAdapter({
        prepare: vi.fn(async () => ({ ready: false, reason: 'Insufficient balance' })),
      })

      const { result } = renderHook(() => useTransaction({ autoPreSteps: false }), {
        wrapper: makeWrapper({ txAdapter }),
      })

      let caught: unknown
      await act(async () => {
        try {
          await result.current.prepare({
            ...testParams,
            preSteps: [preStep1],
          })
        } catch (error) {
          caught = error
        }
      })

      expect(caught).toBeInstanceOf(TransactionNotReadyError)
    })

    it('preStepStatuses is populated after prepare() with preSteps', async () => {
      const txAdapter = makeMockTxAdapter({
        prepare: vi.fn(async () => ({ ready: true })),
      })

      const { result } = renderHook(() => useTransaction({ autoPreSteps: false }), {
        wrapper: makeWrapper({ txAdapter }),
      })

      expect(result.current.preStepStatuses).toEqual([])

      await act(async () => {
        await result.current.prepare({
          ...testParams,
          preSteps: [preStep1, preStep2],
        })
      })

      expect(result.current.preStepStatuses).toEqual(['pending', 'pending'])
    })

    it('executePreStep(index) executes a single pre-step and updates its status', async () => {
      const txAdapter = makeMockTxAdapter()

      const { result } = renderHook(() => useTransaction({ autoPreSteps: false }), {
        wrapper: makeWrapper({ txAdapter }),
      })

      await act(async () => {
        await result.current.prepare({
          ...testParams,
          preSteps: [preStep1, preStep2],
        })
      })

      await act(async () => {
        await result.current.executePreStep(0)
      })

      expect(result.current.preStepStatuses[0]).toBe('completed')
      expect(result.current.preStepStatuses[1]).toBe('pending')
      expect(result.current.preStepResults[0]).toBeDefined()
      expect(result.current.preStepResults[0]?.status).toBe('success')
    })

    it('executePreStep(index) throws when prepare() has not been called', async () => {
      const { result } = renderHook(() => useTransaction({ autoPreSteps: false }), {
        wrapper: makeWrapper(),
      })

      let caught: unknown
      await act(async () => {
        try {
          await result.current.executePreStep(0)
        } catch (error) {
          caught = error
        }
      })

      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toContain('prepare')
    })

    it('executePreStep(index) throws for out-of-bounds index', async () => {
      const txAdapter = makeMockTxAdapter()

      const { result } = renderHook(() => useTransaction({ autoPreSteps: false }), {
        wrapper: makeWrapper({ txAdapter }),
      })

      await act(async () => {
        await result.current.prepare({
          ...testParams,
          preSteps: [preStep1],
        })
      })

      let caught: unknown
      await act(async () => {
        try {
          await result.current.executePreStep(5)
        } catch (error) {
          caught = error
        }
      })

      expect(caught).toBeInstanceOf(RangeError)
    })

    it('executeAllPreSteps() executes all pending pre-steps in order', async () => {
      const executionOrder: number[] = []
      const txAdapter = makeMockTxAdapter({
        execute: vi.fn(async (params) => {
          const payload = params.payload as { type?: string }
          if (payload.type === 'approve-1') {
            executionOrder.push(1)
          }
          if (payload.type === 'approve-2') {
            executionOrder.push(2)
          }
          return { chainType: 'evm', id: '0xhash', chainId: 1 }
        }),
      })

      const { result } = renderHook(() => useTransaction({ autoPreSteps: false }), {
        wrapper: makeWrapper({ txAdapter }),
      })

      await act(async () => {
        await result.current.prepare({
          ...testParams,
          preSteps: [preStep1, preStep2],
        })
      })

      await act(async () => {
        await result.current.executeAllPreSteps()
      })

      expect(executionOrder).toEqual([1, 2])
      expect(result.current.preStepStatuses).toEqual(['completed', 'completed'])
      expect(result.current.preStepResults).toHaveLength(2)
    })

    it('executeAllPreSteps() skips already-completed pre-steps', async () => {
      const txAdapter = makeMockTxAdapter()

      const { result } = renderHook(() => useTransaction({ autoPreSteps: false }), {
        wrapper: makeWrapper({ txAdapter }),
      })

      await act(async () => {
        await result.current.prepare({
          ...testParams,
          preSteps: [preStep1, preStep2],
        })
      })

      // Execute only the first pre-step
      await act(async () => {
        await result.current.executePreStep(0)
      })

      // Now execute all — should skip index 0
      await act(async () => {
        await result.current.executeAllPreSteps()
      })

      // execute called: 1 for preStep0, 1 for preStep1 = 2 total (not 3)
      expect(txAdapter.execute).toHaveBeenCalledTimes(2)
      expect(result.current.preStepStatuses).toEqual(['completed', 'completed'])
    })

    it('execute() succeeds after all pre-steps are manually completed', async () => {
      const txAdapter = makeMockTxAdapter()

      const { result } = renderHook(() => useTransaction({ autoPreSteps: false }), {
        wrapper: makeWrapper({ txAdapter }),
      })

      const paramsWithPreSteps = { ...testParams, preSteps: [preStep1, preStep2] }

      await act(async () => {
        await result.current.prepare(paramsWithPreSteps)
      })

      await act(async () => {
        await result.current.executeAllPreSteps()
      })

      await act(async () => {
        const txResult = await result.current.execute(paramsWithPreSteps)
        expect(txResult.status).toBe('success')
      })

      expect(result.current.result?.status).toBe('success')
    })

    it('execute() throws PreStepsNotExecutedError when pre-steps are not all completed and autoPreSteps is false', async () => {
      const txAdapter = makeMockTxAdapter()

      const { result } = renderHook(() => useTransaction({ autoPreSteps: false }), {
        wrapper: makeWrapper({ txAdapter }),
      })

      const paramsWithPreSteps = { ...testParams, preSteps: [preStep1, preStep2] }

      await act(async () => {
        await result.current.prepare(paramsWithPreSteps)
      })

      // Only complete the first pre-step
      await act(async () => {
        await result.current.executePreStep(0)
      })

      let caught: unknown
      await act(async () => {
        try {
          await result.current.execute(paramsWithPreSteps)
        } catch (error) {
          caught = error
        }
      })

      expect(caught).toBeInstanceOf(PreStepsNotExecutedError)
      expect((caught as PreStepsNotExecutedError).pendingCount).toBe(1)
    })

    it('marks pre-step as failed when executePreStep encounters an error', async () => {
      const txAdapter = makeMockTxAdapter({
        execute: vi.fn(async () => {
          throw new Error('pre-step execution failed')
        }),
      })

      const { result } = renderHook(() => useTransaction({ autoPreSteps: false }), {
        wrapper: makeWrapper({ txAdapter }),
      })

      await act(async () => {
        await result.current.prepare({
          ...testParams,
          preSteps: [preStep1],
        })
      })

      let caught: unknown
      await act(async () => {
        try {
          await result.current.executePreStep(0)
        } catch (error) {
          caught = error
        }
      })

      expect(caught).toBeInstanceOf(Error)
      expect(result.current.preStepStatuses[0]).toBe('failed')
    })
  })

  describe('resolveAdapters', () => {
    it('returns resolveAdapters function on the hook return', () => {
      const { result } = renderHook(() => useTransaction(), { wrapper: makeWrapper() })
      expect(typeof result.current.resolveAdapters).toBe('function')
    })

    it('resolves transaction and wallet adapters by chainId', () => {
      const txAdapter = makeMockTxAdapter()
      const walletAdapter = makeMockWalletAdapter()

      const { result } = renderHook(() => useTransaction(), {
        wrapper: makeWrapper({ txAdapter, walletAdapter }),
      })

      const resolved = result.current.resolveAdapters(1)
      expect(resolved.transactionAdapter).toBe(txAdapter)
      expect(resolved.walletAdapter).toBe(walletAdapter)
    })

    it('throws AdapterNotFoundError for unknown chainId', () => {
      const { result } = renderHook(() => useTransaction(), { wrapper: makeWrapper() })

      expect(() => result.current.resolveAdapters(999)).toThrow(AdapterNotFoundError)
    })

    it('throws AdapterNotFoundError when no wallet adapter matches', () => {
      const chain999 = { ...mockChain, chainId: 999, caip2Id: 'eip155:999', name: 'Unknown' }
      const txAdapter = makeMockTxAdapter({ supportedChains: [chain999] })
      // walletAdapter from makeWrapper only supports chain 1
      const { result } = renderHook(() => useTransaction(), {
        wrapper: makeWrapper({ txAdapter }),
      })

      expect(() => result.current.resolveAdapters(999)).toThrow(AdapterNotFoundError)
      expect(() => result.current.resolveAdapters(999)).toThrow('No wallet adapter found')
    })
  })

  describe('explicit adapter options', () => {
    it('execute() uses explicit transactionAdapter instead of provider lookup', async () => {
      const explicitTxAdapter = makeMockTxAdapter()
      const providerTxAdapter = makeMockTxAdapter()

      const { result } = renderHook(
        () => useTransaction({ transactionAdapter: explicitTxAdapter }),
        { wrapper: makeWrapper({ txAdapter: providerTxAdapter }) },
      )

      await act(async () => {
        await result.current.execute(testParams)
      })

      expect(explicitTxAdapter.prepare).toHaveBeenCalledOnce()
      expect(providerTxAdapter.prepare).not.toHaveBeenCalled()
    })

    it('execute() uses explicit walletAdapter for signer instead of provider lookup', async () => {
      const explicitWalletAdapter = makeMockWalletAdapter()
      const providerWalletAdapter = makeMockWalletAdapter()

      const { result } = renderHook(
        () => useTransaction({ walletAdapter: explicitWalletAdapter }),
        { wrapper: makeWrapper({ walletAdapter: providerWalletAdapter }) },
      )

      await act(async () => {
        await result.current.execute(testParams)
      })

      expect(explicitWalletAdapter.getSigner).toHaveBeenCalledOnce()
      expect(providerWalletAdapter.getSigner).not.toHaveBeenCalled()
    })

    it('can mix explicit transactionAdapter with provider-resolved walletAdapter', async () => {
      const explicitTxAdapter = makeMockTxAdapter()
      const providerWalletAdapter = makeMockWalletAdapter()

      const { result } = renderHook(
        () => useTransaction({ transactionAdapter: explicitTxAdapter }),
        { wrapper: makeWrapper({ walletAdapter: providerWalletAdapter }) },
      )

      await act(async () => {
        await result.current.execute(testParams)
      })

      expect(explicitTxAdapter.prepare).toHaveBeenCalledOnce()
      expect(providerWalletAdapter.getSigner).toHaveBeenCalledOnce()
    })

    it('prepare() uses explicit transactionAdapter', async () => {
      const explicitTxAdapter = makeMockTxAdapter()
      const providerTxAdapter = makeMockTxAdapter()

      const { result } = renderHook(
        () => useTransaction({ transactionAdapter: explicitTxAdapter, autoPreSteps: false }),
        { wrapper: makeWrapper({ txAdapter: providerTxAdapter }) },
      )

      await act(async () => {
        await result.current.prepare(testParams)
      })

      expect(explicitTxAdapter.prepare).toHaveBeenCalledOnce()
      expect(providerTxAdapter.prepare).not.toHaveBeenCalled()
    })

    it('executePreStep() uses explicit adapters', async () => {
      const explicitTxAdapter = makeMockTxAdapter()
      const explicitWalletAdapter = makeMockWalletAdapter()
      const preStep: PreStep = { label: 'Approve', params: { chainId: 1, payload: {} } }

      const { result } = renderHook(
        () =>
          useTransaction({
            transactionAdapter: explicitTxAdapter,
            walletAdapter: explicitWalletAdapter,
            autoPreSteps: false,
          }),
        { wrapper: makeWrapper() },
      )

      await act(async () => {
        await result.current.prepare({ ...testParams, preSteps: [preStep] })
      })

      await act(async () => {
        await result.current.executePreStep(0)
      })

      expect(explicitTxAdapter.execute).toHaveBeenCalled()
      expect(explicitWalletAdapter.getSigner).toHaveBeenCalled()
    })
  })
})
