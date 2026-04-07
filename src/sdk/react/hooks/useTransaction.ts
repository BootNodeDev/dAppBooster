import { useCallback, useMemo, useRef, useState } from 'react'
import type { TransactionLifecycle, TransactionPhase } from '../../core/adapters/lifecycle'
import type {
  ConfirmOptions,
  PrepareResult,
  TransactionParams,
  TransactionRef,
  TransactionResult,
} from '../../core/adapters/transaction'
import { getExplorerUrl } from '../../core/chain/explorer'
import {
  AdapterNotFoundError,
  PreStepsNotExecutedError,
  TransactionNotReadyError,
  WalletNotConnectedError,
} from '../../core/errors'
import { useProviderContext } from '../provider/context'

export type TransactionExecutionPhase = 'idle' | 'prepare' | 'preStep' | 'submit' | 'confirm'

/** Status of an individual pre-step in the manual pre-step control flow. */
export type PreStepStatus = 'pending' | 'executing' | 'completed' | 'failed'

export interface UseTransactionOptions {
  /** Per-operation lifecycle hooks — merged with global lifecycle. Global fires first. */
  lifecycle?: TransactionLifecycle
  /** Auto-execute preSteps before the main transaction. Default: true. */
  autoPreSteps?: boolean
  /** Options forwarded to confirm(). */
  confirmOptions?: ConfirmOptions
}

export interface UseTransactionReturn {
  phase: TransactionExecutionPhase
  prepareResult: PrepareResult | null
  ref: TransactionRef | null
  result: TransactionResult | null
  preStepResults: TransactionResult[]
  preStepStatuses: PreStepStatus[]
  explorerUrl: string | null
  error: Error | null
  execute: (params: TransactionParams) => Promise<TransactionResult>
  prepare: (params: TransactionParams) => Promise<PrepareResult>
  executePreStep: (index: number) => Promise<TransactionResult>
  executeAllPreSteps: () => Promise<TransactionResult[]>
  reset: () => void
}

function fireLifecycle<K extends keyof TransactionLifecycle>(
  key: K,
  global: TransactionLifecycle | undefined,
  local: TransactionLifecycle | undefined,
  ...args: Parameters<NonNullable<TransactionLifecycle[K]>>
): void {
  for (const hooks of [global, local]) {
    const fn = hooks?.[key] as ((...a: unknown[]) => void) | undefined
    if (!fn) {
      continue
    }
    try {
      fn(...(args as unknown[]))
    } catch (err) {
      console.error(`useTransaction lifecycle hook "${key}" threw:`, err)
    }
  }
}

/**
 * Executes a chain transaction through the registered TransactionAdapter,
 * managing phase transitions, preSteps, lifecycle hooks, and error state.
 *
 * @precondition must be called inside a DAppBoosterProvider
 * @postcondition execute() runs the full cycle: prepare -> preSteps -> submit -> confirm
 * @postcondition lifecycle hooks fire: global (from provider) first, per-transaction (from options) second
 * @postcondition hook errors in lifecycle callbacks are logged but never abort the transaction
 * @invariant phase transitions follow: idle -> prepare -> preStep -> submit -> confirm -> idle
 *
 * execute() contract:
 * @precondition params.chainId must match a registered TransactionAdapter
 * @precondition params.chainId must match a registered WalletAdapter
 * @precondition wallet must be connected (getSigner() !== null)
 * @precondition if autoPreSteps === false and preSteps exist -> throws PreStepsNotExecutedError
 * @postcondition returns TransactionResult with status 'success', 'reverted', or 'timeout'
 * @throws {AdapterNotFoundError} if no transaction or wallet adapter supports params.chainId
 * @throws {WalletNotConnectedError} if wallet is not connected
 * @throws {TransactionNotReadyError} if prepare() returns ready === false
 * @throws {PreStepsNotExecutedError} if autoPreSteps === false and preSteps exist
 */
export function useTransaction(options: UseTransactionOptions = {}): UseTransactionReturn {
  const {
    transactionAdapters,
    walletAdapters,
    registry,
    lifecycle: globalLifecycle,
  } = useProviderContext()

  const [phase, setPhase] = useState<TransactionExecutionPhase>('idle')
  const [prepareResult, setPrepareResult] = useState<PrepareResult | null>(null)
  const [ref, setRef] = useState<TransactionRef | null>(null)
  const [result, setResult] = useState<TransactionResult | null>(null)
  const [preStepResults, setPreStepResults] = useState<TransactionResult[]>([])
  const [preStepStatuses, setPreStepStatuses] = useState<PreStepStatus[]>([])
  const [error, setError] = useState<Error | null>(null)

  const preparedParamsRef = useRef<TransactionParams | null>(null)
  const preStepStatusesRef = useRef<PreStepStatus[]>([])
  const preStepResultsRef = useRef<TransactionResult[]>([])

  const explorerUrl = useMemo(
    () => (ref ? getExplorerUrl(registry, { chainId: ref.chainId, tx: ref.id }) : null),
    [ref, registry],
  )

  const reset = useCallback(() => {
    setPhase('idle')
    setPrepareResult(null)
    setRef(null)
    setResult(null)
    setPreStepResults([])
    setPreStepStatuses([])
    setError(null)
    preparedParamsRef.current = null
    preStepStatusesRef.current = []
    preStepResultsRef.current = []
  }, [])

  const { lifecycle: localLifecycle, autoPreSteps = true, confirmOptions } = options

  const execute = useCallback(
    async (params: TransactionParams): Promise<TransactionResult> => {
      const chainIdStr = String(params.chainId)
      let currentPhase: TransactionPhase = 'prepare'

      try {
        const transactionAdapter = Object.values(transactionAdapters).find((adapter) =>
          adapter.supportedChains.some((chain) => String(chain.chainId) === chainIdStr),
        )
        const walletAdapter = Object.values(walletAdapters).find((adapter) =>
          adapter.supportedChains.some((chain) => String(chain.chainId) === chainIdStr),
        )

        if (!transactionAdapter) {
          throw new AdapterNotFoundError(params.chainId, 'transaction')
        }
        if (!walletAdapter) {
          throw new AdapterNotFoundError(params.chainId, 'wallet')
        }

        const signer = await walletAdapter.getSigner()
        if (signer === null) {
          throw new WalletNotConnectedError()
        }

        setPhase('prepare')
        const prepared = await transactionAdapter.prepare(params)
        setPrepareResult(prepared)
        fireLifecycle('onPrepare', globalLifecycle, localLifecycle, prepared)

        if (!prepared.ready) {
          throw new TransactionNotReadyError(prepared.reason ?? 'Transaction preparation failed.')
        }

        if (params.preSteps && params.preSteps.length > 0) {
          currentPhase = 'preStep'
          if (!autoPreSteps) {
            const statuses = preStepStatusesRef.current
            const pendingCount = statuses.filter((s) => s !== 'completed').length
            if (statuses.length !== params.preSteps.length || pendingCount > 0) {
              throw new PreStepsNotExecutedError(
                statuses.length === params.preSteps.length ? pendingCount : params.preSteps.length,
              )
            }
            // All pre-steps already completed manually — skip to main tx
          } else {
            setPhase('preStep')
            for (const [index, preStep] of params.preSteps.entries()) {
              fireLifecycle('onPreStep', globalLifecycle, localLifecycle, preStep, index)
              const preStepRef = await transactionAdapter.execute(preStep.params, signer)
              const preStepResult = await transactionAdapter.confirm(preStepRef, confirmOptions)
              fireLifecycle(
                'onPreStepComplete',
                globalLifecycle,
                localLifecycle,
                preStep,
                index,
                preStepResult,
              )
              setPreStepResults((previous) => [...previous, preStepResult])
            }
          }
        }

        currentPhase = 'submit'
        setPhase('submit')
        const txRef = await transactionAdapter.execute(params, signer)
        setRef(txRef)
        fireLifecycle('onSubmit', globalLifecycle, localLifecycle, txRef)

        currentPhase = 'confirm'
        setPhase('confirm')
        const txResult = await transactionAdapter.confirm(txRef, confirmOptions)
        setResult(txResult)

        if (txResult.ref.id !== txRef.id) {
          fireLifecycle(
            'onReplace',
            globalLifecycle,
            localLifecycle,
            txRef,
            txResult.ref,
            'replaced',
          )
        }

        fireLifecycle('onConfirm', globalLifecycle, localLifecycle, txResult)

        setPhase('idle')
        return txResult
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err))
        setError(errorObj)
        setPhase('idle')
        fireLifecycle('onError', globalLifecycle, localLifecycle, currentPhase, errorObj)
        throw errorObj
      }
    },
    [
      transactionAdapters,
      walletAdapters,
      localLifecycle,
      autoPreSteps,
      confirmOptions,
      globalLifecycle,
    ],
  )

  /**
   * Standalone prepare — resolves the transaction adapter, calls prepare(),
   * fires the onPrepare lifecycle, and initializes preStepStatuses.
   *
   * @precondition params.chainId must match a registered TransactionAdapter
   * @postcondition prepareResult state is set; preStepStatuses initialized to 'pending' for each preStep
   * @throws {AdapterNotFoundError} if no transaction adapter supports params.chainId
   * @throws {TransactionNotReadyError} if prepare() returns ready === false
   */
  const prepare = useCallback(
    async (params: TransactionParams): Promise<PrepareResult> => {
      const chainIdStr = String(params.chainId)

      try {
        const transactionAdapter = Object.values(transactionAdapters).find((adapter) =>
          adapter.supportedChains.some((chain) => String(chain.chainId) === chainIdStr),
        )

        if (!transactionAdapter) {
          throw new AdapterNotFoundError(params.chainId, 'transaction')
        }

        setPhase('prepare')
        const prepared = await transactionAdapter.prepare(params)
        setPrepareResult(prepared)
        fireLifecycle('onPrepare', globalLifecycle, localLifecycle, prepared)

        if (!prepared.ready) {
          throw new TransactionNotReadyError(prepared.reason ?? 'Transaction preparation failed.')
        }

        const stepCount = params.preSteps?.length ?? 0
        const initialStatuses: PreStepStatus[] = Array.from<PreStepStatus>({
          length: stepCount,
        }).fill('pending')
        setPreStepStatuses(initialStatuses)
        preStepStatusesRef.current = initialStatuses
        preStepResultsRef.current = new Array(stepCount)

        preparedParamsRef.current = params
        setPhase('idle')
        return prepared
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err))
        setError(errorObj)
        setPhase('idle')
        throw errorObj
      }
    },
    [transactionAdapters, globalLifecycle, localLifecycle],
  )

  /**
   * Execute a single pre-step by index, updating its status through the
   * executing -> completed | failed lifecycle.
   *
   * @precondition prepare() must have been called first
   * @precondition index must be within bounds of the preSteps array
   * @postcondition preStepStatuses[index] is 'completed' on success, 'failed' on error
   * @throws {Error} if prepare() has not been called
   * @throws {RangeError} if index is out of bounds
   */
  const executePreStep = useCallback(
    async (index: number): Promise<TransactionResult> => {
      const params = preparedParamsRef.current
      if (!params) {
        throw new Error('Cannot executePreStep: prepare() has not been called.')
      }

      const preSteps = params.preSteps ?? []
      if (index < 0 || index >= preSteps.length) {
        throw new RangeError(
          `Pre-step index ${index} is out of bounds (0..${preSteps.length - 1}).`,
        )
      }

      const chainIdStr = String(params.chainId)

      const transactionAdapter = Object.values(transactionAdapters).find((adapter) =>
        adapter.supportedChains.some((chain) => String(chain.chainId) === chainIdStr),
      )
      const walletAdapter = Object.values(walletAdapters).find((adapter) =>
        adapter.supportedChains.some((chain) => String(chain.chainId) === chainIdStr),
      )

      if (!transactionAdapter) {
        throw new AdapterNotFoundError(params.chainId, 'transaction')
      }
      if (!walletAdapter) {
        throw new AdapterNotFoundError(params.chainId, 'wallet')
      }

      const signer = await walletAdapter.getSigner()
      if (signer === null) {
        throw new WalletNotConnectedError()
      }

      const preStep = preSteps[index]

      const updateStatus = (status: PreStepStatus) => {
        preStepStatusesRef.current = preStepStatusesRef.current.map((s, i) =>
          i === index ? status : s,
        )
        setPreStepStatuses([...preStepStatusesRef.current])
      }

      try {
        setPhase('preStep')
        updateStatus('executing')

        fireLifecycle('onPreStep', globalLifecycle, localLifecycle, preStep, index)
        const preStepRef = await transactionAdapter.execute(preStep.params, signer)
        const preStepResult = await transactionAdapter.confirm(preStepRef, confirmOptions)
        fireLifecycle(
          'onPreStepComplete',
          globalLifecycle,
          localLifecycle,
          preStep,
          index,
          preStepResult,
        )

        updateStatus('completed')

        preStepResultsRef.current[index] = preStepResult
        setPreStepResults([...preStepResultsRef.current])

        setPhase('idle')
        return preStepResult
      } catch (err) {
        updateStatus('failed')
        const errorObj = err instanceof Error ? err : new Error(String(err))
        setError(errorObj)
        setPhase('idle')
        throw errorObj
      }
    },
    [transactionAdapters, walletAdapters, globalLifecycle, localLifecycle, confirmOptions],
  )

  /**
   * Execute all pending pre-steps in order, skipping already-completed ones.
   *
   * @precondition prepare() must have been called first
   * @postcondition all preStepStatuses are 'completed' on success
   * @throws {Error} if prepare() has not been called
   */
  const executeAllPreSteps = useCallback(async (): Promise<TransactionResult[]> => {
    const params = preparedParamsRef.current
    if (!params) {
      throw new Error('Cannot executeAllPreSteps: prepare() has not been called.')
    }

    const preSteps = params.preSteps ?? []
    const results: TransactionResult[] = []

    for (let i = 0; i < preSteps.length; i++) {
      if (preStepStatusesRef.current[i] === 'completed') {
        continue
      }
      const stepResult = await executePreStep(i)
      results.push(stepResult)
    }

    return results
  }, [executePreStep])

  return {
    phase,
    prepareResult,
    ref,
    result,
    preStepResults,
    preStepStatuses,
    explorerUrl,
    error,
    execute,
    prepare,
    executePreStep,
    executeAllPreSteps,
    reset,
  }
}
