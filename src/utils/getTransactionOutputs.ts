import { type Abi, type TransactionReceipt, decodeEventLog } from 'viem'

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

/**
 * Type guard to check if a value is a hex string
 * @param value - Value to check
 * @returns True if the value is a hex string starting with '0x'
 */
function isHexString(value: unknown): value is `0x${string}` {
  return typeof value === 'string' && value.startsWith('0x')
}

/**
 * Extracts specified output values from transaction event logs
 *
 * @description
 * This function processes transaction logs to extract specified output values from event arguments.
 * It decodes event logs using the provided ABI and collects values for the requested output keys.
 *
 * @param receipt - The transaction receipt containing event logs
 * @param abi - The ABI used to decode the event logs
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
 *   abi,
 *   ['tokenId', 'to'],
 *   { throwOnMissing: true }
 * )
 * // outputs = { tokenId: '0x...', to: '0x...' }
 * ```
 */
export function getTransactionOutputs<
  T extends readonly string[],
  A extends Abi,
  ThrowOnMissing extends boolean = true,
>(
  receipt: TransactionReceipt,
  abi: A,
  expectedOutputs: T,
  options: {
    throwOnMissing?: ThrowOnMissing
    logDecodeErrors?: boolean
  } = {},
): ThrowOnMissing extends true
  ? { [K in T[number]]: `0x${string}` }
  : Partial<{ [K in T[number]]: `0x${string}` }> {
  const { logDecodeErrors = false, throwOnMissing = true } = options

  const expectedOutputsSet = new Set(expectedOutputs)
  const outputs: Partial<{ [K in T[number]]: `0x${string}` }> = {}

  try {
    for (const log of receipt.logs) {
      try {
        const decodedLog = decodeEventLog({
          abi,
          data: log.data,
          topics: log.topics,
        })

        if (decodedLog.args) {
          for (const [key, value] of Object.entries(decodedLog.args)) {
            if (expectedOutputsSet.has(key) && isHexString(value) && !(key in outputs)) {
              outputs[key as keyof typeof outputs] = value
            }
          }
        }
      } catch (error) {
        if (logDecodeErrors) {
          console.warn('Failed to decode log:', error)
        }
      }
    }

    if (throwOnMissing) {
      const missingOutputs = expectedOutputs.filter((key) => !(key in outputs))
      if (missingOutputs.length > 0) {
        throw new MissingOutputError(missingOutputs)
      }
    }

    return outputs as ThrowOnMissing extends true
      ? { [K in T[number]]: `0x${string}` }
      : Partial<{ [K in T[number]]: `0x${string}` }>
  } catch (error) {
    if (error instanceof TransactionOutputError) {
      throw error
    }
    throw new TransactionOutputError('Failed to process transaction outputs', error)
  }
}
