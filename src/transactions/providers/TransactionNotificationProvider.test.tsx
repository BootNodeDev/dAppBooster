import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { describe, expect, it, vi } from 'vitest'

import {
  TransactionNotificationProvider,
  useTransactionNotification,
} from './TransactionNotificationProvider'

const mockCreate = vi.fn((_options: Record<string, unknown>) => 'toast-1')

vi.mock('@/src/core/components', () => ({
  notificationToaster: {
    create: (options: Record<string, unknown>) => mockCreate(options),
  },
  ExplorerLink: () => null,
  NotificationToast: () => null,
}))

vi.mock('@/src/wallet/hooks', () => ({
  useWeb3Status: vi.fn(() => ({
    readOnlyClient: {
      chain: { id: 1, name: 'Ethereum' },
      waitForTransactionReceipt: vi.fn(async () => ({ status: 'success' })),
    },
  })),
}))

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(TransactionNotificationProvider, null, children)

describe('TransactionNotificationProvider', () => {
  describe('watchSignature', () => {
    it('shows error toast (not success) when signature is rejected', async () => {
      const { result } = renderHook(() => useTransactionNotification(), { wrapper })

      const rejectedPromise = Promise.reject(
        Object.assign(new Error('User rejected'), { shortMessage: 'User rejected the request' }),
      )

      await act(async () => {
        result.current.watchSignature({
          message: 'Sign this',
          signaturePromise: rejectedPromise,
        })
        // Let microtasks settle
        await rejectedPromise.catch(() => {})
      })

      const allArgs = mockCreate.mock.calls.map((call) => call[0])
      const errorToast = allArgs.find((arg) => arg.description === 'User rejected the request')
      expect(errorToast).toBeDefined()
      expect(errorToast?.type).toBe('error')
    })
  })

  describe('watchTx', () => {
    it('does not cause unhandled rejection when txPromise rejects', async () => {
      const { result } = renderHook(() => useTransactionNotification(), { wrapper })

      const rejectedPromise = Promise.reject(
        Object.assign(new Error('User rejected'), { shortMessage: 'User rejected the request' }),
      )

      // If watchTx awaits the same promise twice, the second await
      // would throw an unhandled rejection. This test verifies that
      // watchTx returns cleanly after the first rejection.
      await act(async () => {
        await result.current.watchTx({ txPromise: rejectedPromise })
      })

      // If we reach here without an unhandled rejection, the fix is correct.
      // Also verify the error toast was shown, not a success toast.
      const allArgs = mockCreate.mock.calls.map((call) => call[0])
      const errorToast = allArgs.find(
        (arg) => arg.type === 'error' && arg.description === 'User rejected the request',
      )
      expect(errorToast).toBeDefined()
    })
  })
})
