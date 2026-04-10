import type { TransactionRef, TransactionResult } from '../../core/adapters/transaction'
import { getExplorerUrl } from '../../core/chain/explorer'
import type { ChainRegistry } from '../../core/chain/registry'
import { formatErrorMessage } from '../../core/errors/format'
import type { TransactionLifecycle, WalletLifecycle } from '../../core/lifecycle'

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
  /** Shown when a transaction is replaced (speed-up or cancellation). Defaults to a message including the reason. */
  replaced?: string
  /** Shown when a transaction is cancelled. Defaults to a message including the reason. */
  cancelled?: string
}

export interface SigningNotificationMessages {
  /** Shown when a signature is requested. Defaults to 'Signature requested'. */
  signatureRequested?: string
  /** Shown when a signature is received. Defaults to 'Signature received!'. */
  signatureReceived?: string
  /** Shown when a signing error occurs. Defaults to the error message. */
  error?: string
}

export interface NotificationLifecycleOptions {
  toaster: ToasterAPI
  messages?: NotificationLifecycleMessages
  /** When provided, explorer URLs are appended to confirm and replace toasts. */
  registry?: ChainRegistry
}

export interface SigningNotificationLifecycleOptions {
  toaster: ToasterAPI
  messages?: SigningNotificationMessages
}

/**
 * Builds an explorer URL suffix for a transaction, or empty string if unavailable.
 *
 * @expects ref.id is a valid transaction hash and ref.chainId is a known chain
 * @postcondition returns a string like ' — https://etherscan.io/tx/0x...' or ''
 */
function buildExplorerSuffix(registry: ChainRegistry | undefined, ref: TransactionRef): string {
  if (!registry) {
    return ''
  }
  const url = getExplorerUrl(registry, { chainId: ref.chainId, tx: ref.id })
  return url ? ` — ${url}` : ''
}

/**
 * Creates a TransactionLifecycle that fires toast notifications for submit, confirm, replace, and error events.
 *
 * Pass the result to useTransaction({ lifecycle }) or TransactionButton lifecycle prop.
 *
 * @expects toaster implements the ToasterAPI interface
 * @postcondition returned lifecycle fires toasts for onSubmit, onConfirm, onReplace, and onError
 * @postcondition when registry is provided, confirm and replace toasts include explorer URLs
 */
export function createNotificationLifecycle({
  toaster,
  messages = {},
  registry,
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
      const suffix = buildExplorerSuffix(registry, result.ref)
      toaster.create({
        description: isSuccess
          ? `${messages.confirmed ?? 'Transaction confirmed!'}${suffix}`
          : `${messages.reverted ?? 'Transaction was reverted'}${suffix}`,
        type: isSuccess ? 'success' : 'error',
        ...(toastId ? { id: toastId } : {}),
      })
      toastId = undefined
    },
    onReplace(_oldRef: TransactionRef, newRef: TransactionRef, reason: string) {
      const suffix = buildExplorerSuffix(registry, newRef)
      toaster.create({
        description: messages.replaced ?? `Transaction ${reason}${suffix}`,
        type: 'loading',
        ...(toastId ? { id: toastId } : {}),
      })
    },
    onError(_phase, error) {
      toaster.create({
        description: messages.error ?? formatErrorMessage(error),
        type: 'error',
        ...(toastId ? { id: toastId } : {}),
      })
      toastId = undefined
    },
  }
}

/**
 * Creates a WalletLifecycle that fires toast notifications for signing operations.
 *
 * @expects toaster implements the ToasterAPI interface
 * @postcondition returned lifecycle fires toasts for onSign, onSignComplete, and onSignError
 */
export function createSigningNotificationLifecycle({
  toaster,
  messages = {},
}: SigningNotificationLifecycleOptions): WalletLifecycle {
  let toastId: string | undefined

  return {
    onSign() {
      toastId = toaster.create({
        description: messages.signatureRequested ?? 'Signature requested',
        type: 'loading',
      })
    },
    onSignComplete() {
      toaster.create({
        description: messages.signatureReceived ?? 'Signature received!',
        type: 'success',
        ...(toastId ? { id: toastId } : {}),
      })
      toastId = undefined
    },
    onSignError(error) {
      toaster.create({
        description: messages.error ?? formatErrorMessage(error),
        type: 'error',
        ...(toastId ? { id: toastId } : {}),
      })
      toastId = undefined
    },
  }
}
