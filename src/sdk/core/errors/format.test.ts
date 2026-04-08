import { describe, expect, it } from 'vitest'
import { extractViemErrorMessage, formatErrorMessage, sanitizeErrorMessage } from './format'

describe('extractViemErrorMessage', () => {
  it('returns shortMessage from a viem-like error', () => {
    const error = Object.assign(new Error('verbose message'), {
      shortMessage: 'User rejected the request.',
    })
    expect(extractViemErrorMessage(error)).toBe('User rejected the request.')
  })

  it('returns details when shortMessage is absent', () => {
    const error = Object.assign(new Error('verbose'), { details: 'execution reverted: 51' })
    expect(extractViemErrorMessage(error)).toBe('execution reverted: 51')
  })

  it('walks the cause chain', () => {
    const inner = Object.assign(new Error('inner'), {
      shortMessage: 'User rejected the request.',
    })
    const outer = Object.assign(new Error('outer'), { cause: inner })
    expect(extractViemErrorMessage(outer)).toBe('User rejected the request.')
  })

  it('returns null for plain Error', () => {
    expect(extractViemErrorMessage(new Error('plain'))).toBeNull()
  })

  it('returns null for non-object', () => {
    expect(extractViemErrorMessage('string error')).toBeNull()
    expect(extractViemErrorMessage(null)).toBeNull()
    expect(extractViemErrorMessage(undefined)).toBeNull()
  })
})

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
  it('extracts shortMessage from viem errors and maps to friendly message', () => {
    const error = Object.assign(new Error('verbose'), {
      shortMessage: 'User rejected the request.',
    })
    expect(formatErrorMessage(error)).toBe('Transaction rejected by user')
  })

  it('maps user rejection patterns to friendly message', () => {
    const error = new Error('User rejected the request.')
    expect(formatErrorMessage(error)).toBe('Transaction rejected by user')
  })

  it('maps insufficient funds to friendly message', () => {
    const error = new Error('insufficient funds for gas')
    expect(formatErrorMessage(error)).toBe('Insufficient ETH for gas fees')
  })

  it('extracts revert reason from execution reverted', () => {
    const error = new Error('execution reverted: 51')
    expect(formatErrorMessage(error)).toBe('Transaction reverted: 51')
  })

  it('sanitizes verbose viem messages as fallback', () => {
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

  it('walks cause chain for nested viem errors', () => {
    const inner = Object.assign(new Error('inner'), {
      shortMessage: 'Connector not found.',
    })
    const outer = Object.assign(new Error('outer verbose'), { cause: inner })
    expect(formatErrorMessage(outer)).toBe('Connector not found.')
  })
})
