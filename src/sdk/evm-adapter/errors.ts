/**
 * EVM/viem-specific error message formatting.
 *
 * Layers EVM idioms (gas, nonce, execution reverted, insufficient ETH, already
 * known, replacement underpriced) and viem-shape extraction on top of the
 * paradigm-agnostic core formatter. Non-EVM messages fall through to core's
 * generic `formatErrorMessage`, which still handles the cross-paradigm
 * user-rejection pattern, structured-message extraction, and sanitizing.
 */

import { formatErrorMessage, sanitizeErrorMessage } from '../core/errors/format'

/**
 * Extracts a viem error's `shortMessage`/`details`, walking the cause chain.
 *
 * @expects error is any value (null-safe)
 * @postcondition returns the first shortMessage or details found, or null
 */
function extractViemErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object') {
    return null
  }

  const candidate = error as Record<string, unknown>

  if (typeof candidate.shortMessage === 'string' && candidate.shortMessage) {
    return candidate.shortMessage
  }

  if (typeof candidate.details === 'string' && candidate.details) {
    return candidate.details
  }

  if (candidate.cause && typeof candidate.cause === 'object') {
    return extractViemErrorMessage(candidate.cause)
  }

  return null
}

/**
 * Maps common EVM error idioms to user-friendly messages.
 * Returns null when no EVM pattern matches (caller falls back to core).
 */
function mapEvmPatterns(message: string): string | null {
  const lower = message.toLowerCase()

  if (lower.includes('insufficient funds')) {
    return 'Insufficient ETH for gas fees'
  }

  if (
    lower.includes('user rejected') ||
    lower.includes('user denied') ||
    lower.includes('request was denied') ||
    lower.includes('action_rejected')
  ) {
    return 'Transaction rejected by user'
  }

  if (lower.includes('gas required exceeds allowance')) {
    return 'Transaction requires more gas than allowed'
  }

  if (lower.includes('execution reverted')) {
    const revertMatch = message.match(/execution reverted: (.+)/)
    if (revertMatch) {
      return `Transaction reverted: ${sanitizeErrorMessage(revertMatch[1])}`
    }
    return 'Transaction reverted'
  }

  if (lower.includes('nonce too low')) {
    return 'Transaction nonce is too low. Please try again.'
  }

  if (lower.includes('already known')) {
    return 'Transaction already submitted'
  }

  if (lower.includes('replacement transaction underpriced')) {
    return 'Transaction replacement fee too low'
  }

  return null
}

/**
 * Formats any EVM/viem error into a user-friendly message string.
 *
 * Priority:
 * 1. Extract viem's shortMessage/details (walks the cause chain)
 * 2. Map common EVM patterns (rejection, insufficient ETH, gas, revert, nonce, mempool)
 * 3. Fall through to core's generic `formatErrorMessage` for non-EVM cases
 *
 * @expects error is any value — string, Error, viem error, null, undefined
 * @postcondition returns a clean, user-friendly string (never empty, never throws)
 */
export function formatEvmErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return mapEvmPatterns(error) ?? formatErrorMessage(error)
  }

  if (error && typeof error === 'object') {
    const viemMessage = extractViemErrorMessage(error)
    if (viemMessage) {
      return mapEvmPatterns(viemMessage) ?? formatErrorMessage(viemMessage)
    }

    const message = error instanceof Error ? error.message : null
    if (message) {
      const mapped = mapEvmPatterns(message)
      if (mapped) {
        return mapped
      }
    }
  }

  return formatErrorMessage(error)
}
