/**
 * User-friendly error message formatting for blockchain errors.
 *
 * Extracts clean messages from viem errors (shortMessage, details, cause chain),
 * sanitizes verbose technical output, and maps common patterns to friendly text.
 *
 * Ported from covenant-interface's error library — generic parts only,
 * no app-specific error selectors.
 */

/**
 * Extracts shortMessage from viem errors, walking the cause chain if needed.
 *
 * @expects error is any value (null-safe)
 * @postcondition returns the first shortMessage or details found, or null
 */
export function extractViemErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object') {
    return null
  }

  const e = error as Record<string, unknown>

  if (typeof e.shortMessage === 'string' && e.shortMessage) {
    return e.shortMessage
  }

  if (typeof e.details === 'string' && e.details) {
    return e.details
  }

  if (e.cause && typeof e.cause === 'object') {
    return extractViemErrorMessage(e.cause)
  }

  return null
}

/**
 * Strips technical data (hex, addresses, viem internals) from error messages.
 * Acts as a safety net so no raw data leaks to the user.
 *
 * @expects message is a non-empty string
 * @postcondition returns a sanitized string with technical data removed
 */
export function sanitizeErrorMessage(message: string): string {
  let sanitized = message

  const requestArgsIdx = sanitized.indexOf('Request Arguments:')
  if (requestArgsIdx !== -1) {
    sanitized = sanitized.substring(0, requestArgsIdx).trim()
  }

  const contractCallIdx = sanitized.indexOf('Contract Call:')
  if (contractCallIdx !== -1) {
    sanitized = sanitized.substring(0, contractCallIdx).trim()
  }

  sanitized = sanitized.replace(/Version:\s*viem@[\d.]+/g, '').trim()

  // Strip hex values in length order: long calldata → addresses → shorter hex
  sanitized = sanitized.replace(/0x[a-fA-F0-9]{41,}/g, '[...]').trim()
  sanitized = sanitized.replace(/0x[a-fA-F0-9]{40}(?![a-fA-F0-9])/g, '[address]').trim()
  sanitized = sanitized.replace(/0x[a-fA-F0-9]{9,39}(?![a-fA-F0-9])/g, '[...]').trim()
  sanitized = sanitized.replace(/0x[a-fA-F0-9]{8}(?![a-fA-F0-9])/g, '[...]').trim()
  sanitized = sanitized.replace(/\n{3,}/g, '\n').trim()

  if (!sanitized || sanitized === '[...]' || sanitized === '[address]') {
    return 'An unexpected error occurred'
  }

  return sanitized
}

/**
 * Formats any error into a user-friendly message string.
 *
 * Priority:
 * 1. Extract viem shortMessage (walks cause chain)
 * 2. Map common patterns (user rejection, insufficient funds, gas, nonce)
 * 3. Extract revert reason from "execution reverted: ..." pattern
 * 4. Sanitize remaining verbose messages (strip hex, addresses, technical blocks)
 *
 * @expects error is any value — string, Error, viem error, null, undefined
 * @postcondition returns a clean, user-friendly string (never empty, never throws)
 */
export function formatErrorMessage(error: unknown): string {
  if (error === null || error === undefined) {
    return 'An unexpected error occurred'
  }

  if (typeof error === 'string') {
    return mapCommonPatterns(error) ?? sanitizeErrorMessage(error)
  }

  if (typeof error !== 'object') {
    return String(error)
  }

  // Try viem's shortMessage first (cleanest source)
  const viemMessage = extractViemErrorMessage(error)
  if (viemMessage) {
    return mapCommonPatterns(viemMessage) ?? sanitizeErrorMessage(viemMessage)
  }

  // Fall back to Error.message
  const message = error instanceof Error ? error.message : String(error)
  return mapCommonPatterns(message) ?? sanitizeErrorMessage(message)
}

/**
 * Maps common error patterns to user-friendly messages.
 * Returns null if no pattern matches (caller should use sanitize as fallback).
 */
function mapCommonPatterns(message: string): string | null {
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
