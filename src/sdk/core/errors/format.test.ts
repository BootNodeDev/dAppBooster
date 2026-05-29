import { describe, expect, it } from 'vitest'
import { formatErrorMessage, sanitizeErrorMessage } from './format'

describe('sanitizeErrorMessage', () => {
  it('strips Request Arguments block', () => {
    const msg = 'User rejected. Request Arguments: from: 0xabc to: 0xdef'
    expect(sanitizeErrorMessage(msg)).toBe('User rejected.')
  })

  it('strips Contract Call block', () => {
    const msg = 'Reverted with reason: 51 Contract Call: address: 0x123'
    expect(sanitizeErrorMessage(msg)).toBe('Reverted with reason: 51')
  })

  it('strips viem version string', () => {
    const msg = 'Some error Version: viem@2.47.6'
    expect(sanitizeErrorMessage(msg)).toBe('Some error')
  })

  it('replaces long hex values with [...]', () => {
    const msg = 'data: 0x3dbb202b000000000000000000000000589750ba rest'
    expect(sanitizeErrorMessage(msg)).not.toContain('0x3dbb202b')
  })

  it('replaces 40-char hex addresses with [address]', () => {
    const msg = 'from: 0x19433c47bF16f0D6E14Ff68ec4f5fafA2d9C8756 done'
    expect(sanitizeErrorMessage(msg)).toContain('[address]')
    expect(sanitizeErrorMessage(msg)).not.toContain('0x19433c47')
  })

  it('returns fallback for empty result', () => {
    expect(sanitizeErrorMessage('0x1234567890abcdef1234567890abcdef12345678')).toBe(
      'An unexpected error occurred',
    )
  })
})

describe('formatErrorMessage', () => {
  it('maps the cross-paradigm user-rejection pattern to a neutral message', () => {
    expect(formatErrorMessage(new Error('User rejected the request.'))).toBe('Request rejected')
    expect(formatErrorMessage(new Error('User denied transaction signature'))).toBe(
      'Request rejected',
    )
    expect(formatErrorMessage(new Error('the request was denied'))).toBe('Request rejected')
    expect(formatErrorMessage(new Error('ACTION_REJECTED'))).toBe('Request rejected')
  })

  it('extracts a structured message from a shortMessage field', () => {
    const error = Object.assign(new Error('verbose'), {
      shortMessage: 'User rejected the request.',
    })
    expect(formatErrorMessage(error)).toBe('Request rejected')
  })

  it('extracts a structured message from a details field when shortMessage is absent', () => {
    const error = Object.assign(new Error('verbose'), { details: 'Connector not found.' })
    expect(formatErrorMessage(error)).toBe('Connector not found.')
  })

  it('walks the cause chain for nested structured errors', () => {
    const inner = Object.assign(new Error('inner'), {
      shortMessage: 'Connector not found.',
    })
    const outer = Object.assign(new Error('outer verbose'), { cause: inner })
    expect(formatErrorMessage(outer)).toBe('Connector not found.')
  })

  it('sanitizes verbose messages as fallback', () => {
    const error = new Error(
      'Something failed Request Arguments: from: 0xabc data: 0x1234 Contract Call: address: 0xdef',
    )
    const result = formatErrorMessage(error)
    expect(result).not.toContain('Request Arguments')
    expect(result).not.toContain('Contract Call')
  })

  it('handles string errors', () => {
    expect(formatErrorMessage('something broke')).toBe('something broke')
  })

  it('handles null/undefined', () => {
    expect(formatErrorMessage(null)).toBe('An unexpected error occurred')
    expect(formatErrorMessage(undefined)).toBe('An unexpected error occurred')
  })

  it('coerces non-string non-object primitives via String()', () => {
    expect(formatErrorMessage(42)).toBe('42')
    expect(formatErrorMessage(true)).toBe('true')
  })

  it('does NOT map EVM-specific patterns (those belong to the evm-adapter)', () => {
    expect(formatErrorMessage(new Error('insufficient funds for gas'))).not.toContain(
      'Insufficient ETH',
    )
    expect(formatErrorMessage(new Error('execution reverted: 51'))).not.toBe('Transaction reverted')
    expect(formatErrorMessage(new Error('nonce too low'))).not.toContain('nonce is too low')
  })
})
