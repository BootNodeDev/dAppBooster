import { type AbiEvent, type Log, type TransactionReceipt, decodeEventLog, isHex } from 'viem'

/**
 * Custom error class for transaction output processing errors
 */
export class TransactionOutputError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'TransactionOutputError'
  }
}

/**
 * Error thrown when required outputs are not found in transaction logs
 */
export class MissingOutputError extends TransactionOutputError {
  constructor(public readonly missingKeys: string[]) {
    super(`Missing required outputs: ${missingKeys.join(', ')}`)
    this.name = 'MissingOutputError'
  }
}

type TransactionOutput = `0x${string}`

type OutputsConfig = {
  throwOnMissing?: boolean
  logDecodeErrors?: boolean
}

type OutputResult<
  T extends readonly string[],
  ThrowOnMissing extends boolean,
> = ThrowOnMissing extends true
  ? Record<T[number], TransactionOutput>
  : Partial<Record<T[number], TransactionOutput>>

/**
 * Process a single transaction log to extract event arguments
 */
function processTransactionLog<T extends readonly string[]>(
  log: Log,
  abiEvent: AbiEvent,
  expectedOutputsSet: Set<string>,
  outputs: Partial<Record<T[number], TransactionOutput>>,
  logDecodeErrors: boolean,
): void {
  try {
    const decodedLog = decodeEventLog({
      abi: [abiEvent],
      data: log.data,
      topics: log.topics,
    })

    if (!decodedLog.args) return

    for (const [key, value] of Object.entries(decodedLog.args)) {
      if (expectedOutputsSet.has(key) && isHex(value) && !(key in outputs)) {
        outputs[key as T[number]] = value as TransactionOutput
      }
    }
  } catch (error) {
    if (logDecodeErrors) {
      console.warn('Failed to decode log:', error)
    }
  }
}

/**
 * Extracts specified output values from transaction event logs
 *
 * @description
 * This function processes transaction logs to extract specified output values from event arguments.
 * It decodes event logs using the provided ABI and collects values for the requested output keys.
 *
 * @param receipt - The transaction receipt containing event logs
 * @param abiEvent - The ABI event definition used to decode the event logs
 * @param expectedOutputs - Array of output keys to extract from event args
 * @param options - Configuration options
 * @param options.throwOnMissing - If true, throws when required outputs are not found (default: true)
 * @param options.logDecodeErrors - If true, logs errors when decoding events fails (default: false)
 *
 * @returns Object containing the requested output values as hex strings
 *
 * @throws {MissingOutputError} When required outputs are not found and throwOnMissing is true
 * @throws {TransactionOutputError} When transaction processing fails
 *
 * @example
 * ```ts
 * const receipt = await getTransactionReceipt(hash)
 * const outputs = getTransactionOutputs(
 *   receipt,
 *   abiEvent,
 *   ['tokenId', 'to'],
 *   { throwOnMissing: true }
 * )
 * // outputs = { tokenId: '0x...', to: '0x...' }
 * ```
 */
export function getTransactionOutputs<
  T extends readonly string[],
  ThrowOnMissing extends boolean = true,
>(
  receipt: TransactionReceipt,
  abiEvent: AbiEvent,
  expectedOutputs: T,
  options: OutputsConfig = {},
): OutputResult<T, ThrowOnMissing> {
  const { logDecodeErrors = false, throwOnMissing = true } = options
  const expectedOutputsSet = new Set(expectedOutputs)
  const outputs = {} as OutputResult<T, ThrowOnMissing>

  try {
    for (const log of receipt.logs) {
      processTransactionLog(log, abiEvent, expectedOutputsSet, outputs, logDecodeErrors)
    }

    if (throwOnMissing) {
      const missingOutputs = expectedOutputs.filter((key) => !(key in outputs))
      if (missingOutputs.length > 0) {
        throw new MissingOutputError(missingOutputs)
      }
    }

    return outputs
  } catch (error) {
    if (error instanceof TransactionOutputError) {
      throw error
    }
    throw new TransactionOutputError('Failed to process transaction outputs', error)
  }
}
