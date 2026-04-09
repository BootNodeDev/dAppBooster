import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { DAppBoosterProvider, useProviderContext } from './index'

describe('useProviderContext export', () => {
  it('is importable from the provider barrel', () => {
    expect(typeof useProviderContext).toBe('function')
  })

  it('returns context value inside DAppBoosterProvider', () => {
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(DAppBoosterProvider, { config: {} }, children)

    const { result } = renderHook(() => useProviderContext(), { wrapper })

    expect(result.current).toHaveProperty('walletAdapters')
    expect(result.current).toHaveProperty('transactionAdapters')
    expect(result.current).toHaveProperty('registry')
  })

  it('throws when called outside DAppBoosterProvider', () => {
    expect(() => {
      renderHook(() => useProviderContext())
    }).toThrow('useProviderContext must be called inside a DAppBoosterProvider')
  })
})
