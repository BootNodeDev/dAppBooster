import { ExplorerLink } from '@/src/components/sharedComponents/ExplorerLink'
import {
  NotificationToast,
  notificationToaster,
} from '@/src/components/sharedComponents/NotificationToast'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { type FC, type PropsWithChildren, type ReactNode, createContext, useContext } from 'react'
import type {
  Hash,
  ReplacementReturnType,
  SignMessageErrorType,
  TransactionExecutionError,
} from 'viem'

type WatchSignatureArgs = {
  successMessage?: string
  message: ReactNode | string
  signaturePromise: Promise<Hash>
  onToastId?: (toastId: string) => void
  showSuccessToast?: boolean
}

type WatchHashArgs = {
  message?: string
  successMessage?: string
  errorMessage?: string
  hash: Hash
  toastId?: string
}

type WatchTxArgs = { txPromise: Promise<Hash>; methodId?: string }

type TransactionContextValue = {
  watchSignature: (args: WatchSignatureArgs) => void
  watchHash: (args: WatchHashArgs) => void
  watchTx: (args: WatchTxArgs) => void
}

const TransactionContext = createContext<TransactionContextValue | undefined>(undefined)

/**
 * Provider component for transaction notifications
 *
 * Manages transaction-related notifications including signature requests,
 * transaction submissions, and transaction confirmations.
 *
 * Provides context with methods for:
 * - watchSignature: Tracks a signature request and displays appropriate notifications
 * - watchHash: Monitors a transaction by hash and shows its progress/outcome
 * - watchTx: Combines signature and transaction monitoring in one method
 *
 * @example
 * ```tsx
 * <TransactionNotificationProvider>
 *   <App />
 * </TransactionNotificationProvider>
 * ```
 */
export const TransactionNotificationProvider: FC<PropsWithChildren> = ({ children }) => {
  const { readOnlyClient } = useWeb3Status()
  const chain = readOnlyClient?.chain

  async function watchSignature({
    message,
    onToastId,
    showSuccessToast = true,
    signaturePromise,
    successMessage = 'Signature received!',
  }: WatchSignatureArgs) {
    const toastId = notificationToaster.create({
      description: message,
      type: 'loading',
    })
    onToastId?.(toastId)

    try {
      await signaturePromise
      if (showSuccessToast) {
        notificationToaster.create({
          description: successMessage,
          type: 'success',
          id: toastId,
        })
      }
    } catch (e) {
      const error = e as TransactionExecutionError | SignMessageErrorType
      const message =
        'shortMessage' in error ? error.shortMessage : error.message || 'An error occurred'

      notificationToaster.create({
        description: message,
        type: 'success',
        id: toastId,
      })
    }
  }

  async function watchHash({
    errorMessage = 'Transaction was reverted!',
    hash,
    message = 'Transaction sent',
    successMessage = 'Transaction has been mined!',
    toastId,
  }: WatchHashArgs) {
    if (!chain) {
      console.error('Chain is not defined')
      return
    }

    if (!readOnlyClient) {
      console.error('ReadOnlyClient is not defined')
      return
    }

    notificationToaster.create({
      description: message,
      type: 'loading',
      id: toastId,
    })

    try {
      let replacedTx = null as ReplacementReturnType | null
      const receipt = await readOnlyClient.waitForTransactionReceipt({
        hash,
        // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
        onReplaced: (replacedTxData) => (replacedTx = replacedTxData),
      })

      if (replacedTx !== null) {
        if (['replaced', 'cancelled'].includes(replacedTx.reason)) {
          notificationToaster.create({
            description: (
              <div>
                <div>Transaction has been {replacedTx.reason}!</div>
                <ExplorerLink
                  chain={chain}
                  hashOrAddress={replacedTx.transaction.hash}
                />
              </div>
            ),
            type: 'error',
            id: toastId,
          })
        } else {
          notificationToaster.create({
            description: (
              <div>
                <div>{successMessage}</div>
                <ExplorerLink
                  chain={chain}
                  hashOrAddress={replacedTx.transaction.hash}
                />
              </div>
            ),
            type: 'success',
            id: toastId,
          })
        }
        return
      }

      if (receipt.status === 'success') {
        notificationToaster.create({
          description: (
            <div>
              <div>{successMessage}</div>
              <ExplorerLink
                chain={chain}
                hashOrAddress={hash}
              />
            </div>
          ),
          type: 'success',
          id: toastId,
        })
      } else {
        notificationToaster.create({
          description: (
            <div>
              <div>{errorMessage}</div>
              <ExplorerLink
                chain={chain}
                hashOrAddress={hash}
              />
            </div>
          ),
          type: 'error',
          id: toastId,
        })
      }
    } catch (error) {
      console.error('Error watching hash', error)
    }
  }

  async function watchTx({ methodId, txPromise }: WatchTxArgs) {
    const transactionMessage = methodId ? `Transaction for calling ${methodId}` : 'Transaction'

    let toastId = ''
    await watchSignature({
      message: `Signature requested: ${transactionMessage}`,
      signaturePromise: txPromise,
      showSuccessToast: false,
      // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
      onToastId: (id) => (toastId = id),
    })

    const hash = await txPromise
    await watchHash({
      hash,
      toastId,
      message: `${transactionMessage} is pending to be mined ...`,
      successMessage: `${transactionMessage} has been mined!`,
      errorMessage: `${transactionMessage} has reverted!`,
    })
  }

  return (
    <TransactionContext.Provider value={{ watchTx, watchHash, watchSignature }}>
      {children}
      <NotificationToast />
    </TransactionContext.Provider>
  )
}

export function useTransactionNotification() {
  const context = useContext(TransactionContext)

  if (context === undefined) {
    throw new Error(
      'useTransactionNotification must be used within a TransactionNotificationProvider',
    )
  }
  return context
}
