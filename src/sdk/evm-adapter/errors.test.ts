import { describe, expect, it } from 'vitest'
import { formatEvmErrorMessage } from './errors'

describe('formatEvmErrorMessage', () => {
  it('extracts shortMessage from viem errors and maps to friendly message', () => {
    const error = Object.assign(new Error('verbose'), {
      shortMessage: 'User rejected the request.',
    })
    expect(formatEvmErrorMessage(error)).toBe('Transaction rejected by user')
  })

  it('maps user rejection patterns to friendly message', () => {
    const error = new Error('User rejected the request.')
    expect(formatEvmErrorMessage(error)).toBe('Transaction rejected by user')
  })

  it('maps action_rejected to friendly message', () => {
    const error = new Error('ACTION_REJECTED')
    expect(formatEvmErrorMessage(error)).toBe('Transaction rejected by user')
  })

  it('maps insufficient funds to friendly message', () => {
    const error = new Error('insufficient funds for gas')
    expect(formatEvmErrorMessage(error)).toBe('Insufficient ETH for gas fees')
  })

  it('extracts revert reason from execution reverted', () => {
    const error = new Error('execution reverted: 51')
    expect(formatEvmErrorMessage(error)).toBe('Transaction reverted: 51')
  })

  it('classifies "execution reverted" without a parseable message', () => {
    const error = Object.assign(new Error('something'), {
      shortMessage: 'execution reverted',
    })
    expect(formatEvmErrorMessage(error)).toBe('Transaction reverted')
  })

  it('classifies "nonce too low" errors', () => {
    const error = Object.assign(new Error('verbose'), {
      shortMessage: 'nonce too low for current account',
    })
    expect(formatEvmErrorMessage(error)).toBe('Transaction nonce is too low. Please try again.')
  })

  it('classifies "already known" errors', () => {
    const error = Object.assign(new Error('verbose'), {
      shortMessage: 'transaction already known to the mempool',
    })
    expect(formatEvmErrorMessage(error)).toBe('Transaction already submitted')
  })

  it('classifies "replacement transaction underpriced" errors', () => {
    const error = Object.assign(new Error('verbose'), {
      shortMessage: 'replacement transaction underpriced',
    })
    expect(formatEvmErrorMessage(error)).toBe('Transaction replacement fee too low')
  })

  it('classifies "gas required exceeds allowance" errors', () => {
    const error = Object.assign(new Error('verbose'), {
      shortMessage: 'gas required exceeds allowance',
    })
    expect(formatEvmErrorMessage(error)).toBe('Transaction requires more gas than allowed')
  })

  it('walks cause chain for nested viem errors', () => {
    const inner = Object.assign(new Error('inner'), {
      shortMessage: 'Connector not found.',
    })
    const outer = Object.assign(new Error('outer verbose'), { cause: inner })
    expect(formatEvmErrorMessage(outer)).toBe('Connector not found.')
  })

  it('sanitizes verbose viem messages as fallback', () => {
    const error = new Error(
      'Something failed Request Arguments: from: 0xabc data: 0x1234 Contract Call: address: 0xdef',
    )
    const result = formatEvmErrorMessage(error)
    expect(result).not.toContain('Request Arguments')
    expect(result).not.toContain('Contract Call')
  })

  it('handles string errors', () => {
    expect(formatEvmErrorMessage('something broke')).toBe('something broke')
  })

  it('handles null/undefined', () => {
    expect(formatEvmErrorMessage(null)).toBe('An unexpected error occurred')
    expect(formatEvmErrorMessage(undefined)).toBe('An unexpected error occurred')
  })

  it('coerces non-string non-object primitives via String()', () => {
    expect(formatEvmErrorMessage(42)).toBe('42')
    expect(formatEvmErrorMessage(true)).toBe('true')
  })
})
