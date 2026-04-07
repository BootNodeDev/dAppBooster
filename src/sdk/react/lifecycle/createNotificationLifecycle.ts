import type { TransactionLifecycle } from '../../core/adapters/lifecycle'
import type { TransactionResult } from '../../core/adapters/transaction'

/** Minimal interface for the toast notification API. */
export interface ToasterAPI {
  create(options: {
    description: string
    type: 'loading' | 'success' | 'error'
    id?: string
  }): string
}

export interface NotificationLifecycleMessages {
  /** Shown when transaction is submitted. Defaults to 'Transaction submitted'. */
  submitted?: string
  /** Shown when transaction is confirmed with success status. Defaults to 'Transaction confirmed!'. */
  confirmed?: string
  /** Shown when transaction is reverted. Defaults to 'Transaction was reverted'. */
  reverted?: string
  /** Shown when an error occurs. Defaults to the error message. */
  error?: string
}

export interface NotificationLifecycleOptions {
  toaster: ToasterAPI
  messages?: NotificationLifecycleMessages
}

/**
 * Creates a TransactionLifecycle that fires toast notifications for submit, confirm, and error events.
 *
 * Pass the result to useTransaction({ lifecycle }) or TransactionButton lifecycle prop.
 */
export function createNotificationLifecycle({
  toaster,
  messages = {},
}: NotificationLifecycleOptions): TransactionLifecycle {
  let toastId: string | undefined

  return {
    onSubmit() {
      toastId = toaster.create({
        description: messages.submitted ?? 'Transaction submitted',
        type: 'loading',
      })
    },
    onConfirm(result: TransactionResult) {
      const isSuccess = result.status === 'success'
      toaster.create({
        description: isSuccess
          ? (messages.confirmed ?? 'Transaction confirmed!')
          : (messages.reverted ?? 'Transaction was reverted'),
        type: isSuccess ? 'success' : 'error',
        id: toastId,
      })
      toastId = undefined
    },
    onError(_phase, error) {
      toaster.create({
        description: messages.error ?? error.message,
        type: 'error',
        id: toastId,
      })
      toastId = undefined
    },
  }
}
