import { zeroAddress } from 'viem'
import { describe, expect, it, vi } from 'vitest'

// Mock env before importing isNativeToken so the module sees the mock
vi.mock('@/src/env', () => ({
  env: {
    PUBLIC_NATIVE_TOKEN_ADDRESS: zeroAddress.toLowerCase(),
  },
}))

import { isNativeToken } from './address'

describe('isNativeToken', () => {
  it('returns true for the zero address (default native token)', () => {
    expect(isNativeToken(zeroAddress)).toBe(true)
  })

  it('returns true for the zero address in lowercase', () => {
    expect(isNativeToken(zeroAddress.toLowerCase())).toBe(true)
  })

  it('returns true for the zero address string literal', () => {
    // zeroAddress is already lowercase; the literal string is identical — testing the exact value
    expect(isNativeToken('0x0000000000000000000000000000000000000000')).toBe(true)
  })

  it('returns false for a regular ERC20 contract address', () => {
    expect(isNativeToken('0x71C7656EC7ab88b098defB751B7401B5f6d8976F')).toBe(false)
  })

  it('comparison is case-insensitive', () => {
    // Both upper and lower case should match the native token (zero address)
    expect(isNativeToken('0X0000000000000000000000000000000000000000')).toBe(true)
  })
})
