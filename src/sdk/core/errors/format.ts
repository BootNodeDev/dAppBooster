/**
 * Paradigm-agnostic, user-friendly error message formatting.
 *
 * Core keeps only NEUTRAL behavior: extracting a message from common error
 * shapes, the cross-paradigm user-rejection pattern, PII/hex/version sanitizing,
 * and a generic fallback. Paradigm-specific idioms (EVM gas/nonce/revert, viem
 * branding, "Insufficient ETH", etc.) live in the corresponding adapter
 * (see `evm-adapter/errors.ts`).
 */

/**
 * Extracts a message from common structured-error shapes, walking the cause chain.
 *
 * Reads `shortMessage` then `details` — a widespread convention across error
 * libraries (viem, ethers, and many SDKs surface a concise field alongside the
 * verbose `message`). Neutral and paradigm-agnostic.
 *
 * @expects error is any value (null-safe)
 * @postcondition returns the first shortMessage or details found, or null
 */
function extractStructuredMessage(error: unknown): string | null {
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
    return extractStructuredMessage(candidate.cause)
  }

  return null
}

/**
 * Strips technical data (hex, addresses, version internals) from error messages.
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
 * Maps the cross-paradigm user-rejection pattern to a neutral friendly message.
 * Returns null when the message is not a rejection (caller falls back to sanitize).
 *
 * Wallet rejections are universal across paradigms — EVM (`user rejected`,
 * `action_rejected`), Canton, Solana, etc. all surface the same intent.
 */
function mapUserRejection(message: string): string | null {
  const lower = message.toLowerCase()

  if (
    lower.includes('user rejected') ||
    lower.includes('user denied') ||
    lower.includes('request was denied') ||
    lower.includes('action_rejected')
  ) {
    return 'Request rejected'
  }

  return null
}

/**
 * Formats any error into a user-friendly, paradigm-agnostic message string.
 *
 * Priority:
 * 1. Extract a structured message from common shapes (shortMessage/details, cause chain)
 * 2. Map the cross-paradigm user-rejection pattern
 * 3. Sanitize remaining verbose messages (strip hex, addresses, technical blocks)
 *
 * @expects error is any value — string, Error, structured error, null, undefined
 * @postcondition returns a clean, user-friendly string (never empty, never throws)
 */
export function formatErrorMessage(error: unknown): string {
  if (error === null || error === undefined) {
    return 'An unexpected error occurred'
  }

  if (typeof error === 'string') {
    return mapUserRejection(error) ?? sanitizeErrorMessage(error)
  }

  if (typeof error !== 'object') {
    return String(error)
  }

  const structuredMessage = extractStructuredMessage(error)
  if (structuredMessage) {
    return mapUserRejection(structuredMessage) ?? sanitizeErrorMessage(structuredMessage)
  }

  const message = error instanceof Error ? error.message : String(error)
  return mapUserRejection(message) ?? sanitizeErrorMessage(message)
}
