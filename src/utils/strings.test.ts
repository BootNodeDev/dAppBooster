import { describe, expect, it } from 'vitest'
import { getTruncatedHash, truncateStringInTheMiddle } from './strings'

describe('truncateStringInTheMiddle', () => {
  it('truncates a long string keeping start and end', () => {
    const result = truncateStringInTheMiddle('0x1234567890abcdef1234567890abcdef12345678', 8, 6)
    expect(result).toBe('0x123456...345678')
  })

  it('returns the original string when it fits within start + end length', () => {
    const result = truncateStringInTheMiddle('short', 4, 4)
    expect(result).toBe('short')
  })

  it('returns the original string when length equals start + end exactly', () => {
    const result = truncateStringInTheMiddle('1234567890', 5, 5)
    expect(result).toBe('1234567890')
  })

  it('truncates when length exceeds start + end by one', () => {
    const result = truncateStringInTheMiddle('12345678901', 5, 5)
    expect(result).toBe('12345...78901')
  })

  it('handles empty string', () => {
    const result = truncateStringInTheMiddle('', 4, 4)
    expect(result).toBe('')
  })

  it('handles asymmetric start and end positions', () => {
    const result = truncateStringInTheMiddle('abcdefghijklmnop', 3, 7)
    expect(result).toBe('abc...jklmnop')
  })

  it('handles start position of 0', () => {
    const result = truncateStringInTheMiddle('abcdefghij', 0, 3)
    expect(result).toBe('...hij')
  })
})

describe('getTruncatedHash', () => {
  const address = '0x1234567890abcdef1234567890abcdef12345678'
  const txHash = '0xd85ef8c70dc31a4f8d5bf0331e1eac886935905f15d32e71b348df745cd38e19'

  it('truncates with default length of 6', () => {
    const result = getTruncatedHash(address)
    // 0x + 6 chars ... last 6 chars
    expect(result).toBe('0x123456...345678')
  })

  it('truncates with custom length', () => {
    const result = getTruncatedHash(address, 4)
    // 0x + 4 chars ... last 4 chars
    expect(result).toBe('0x1234...5678')
  })

  it('truncates a transaction hash', () => {
    const result = getTruncatedHash(txHash, 6)
    expect(result).toBe('0xd85ef8...d38e19')
  })

  it('clamps length to minimum of 1', () => {
    const result = getTruncatedHash(address, 0)
    // length clamped to 1: 0x + 1 char ... last 1 char
    expect(result).toBe('0x1...8')
  })

  it('clamps length to maximum of 16', () => {
    const result = getTruncatedHash(address, 100)
    // address = '0x1234567890abcdef1234567890abcdef12345678' (42 chars)
    // length clamped to 16: slice(0, 18) = '0x1234567890abcdef', slice(42-16, 42) = '90abcdef12345678'
    expect(result).toBe('0x1234567890abcdef...90abcdef12345678')
  })

  it('handles negative length by clamping to 1', () => {
    const result = getTruncatedHash(address, -5)
    expect(result).toBe('0x1...8')
  })
})
