import { type FC, type PropsWithChildren, createContext, useContext } from 'react'

import toast from 'react-hot-toast'
import type {
  Hash,
  ReplacementReturnType,
  SignMessageErrorType,
  TransactionExecutionError,
} from 'viem'

import { ExplorerLink } from '@/src/components/sharedComponents/ExplorerLink'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { ToastNotification } from '@/src/lib/toast/ToastNotification'

type WatchSignatureArgs = {
  successMessage?: string
  message: JSX.Element | string
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
    const toastId = toast.loading(() => <ToastNotification message={message} />)
    onToastId?.(toastId)

    try {
      await signaturePromise
      if (showSuccessToast) {
        toast.success(<ToastNotification message={successMessage} />, {
          id: toastId,
        })
      }
    } catch (e) {
      const error = e as TransactionExecutionError | SignMessageErrorType
      let message = error.message || 'An error occurred'
      if ('shortMessage' in error) {
        message = error.shortMessage
      }
      toast.error(<ToastNotification message={message} />, { id: toastId })
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

    toast.loading(() => <ToastNotification message={message} />, {
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
          toast.error(
            <div>
              <div>Transaction has been {replacedTx.reason}!</div>
              <ExplorerLink
                chain={chain}
                hashOrAddress={replacedTx.transaction.hash}
              />
            </div>,
            { id: toastId },
          )
        } else {
          toast.success(
            <div>
              <div>{successMessage}</div>
              <ExplorerLink
                chain={chain}
                hashOrAddress={replacedTx.transaction.hash}
              />
            </div>,
            { id: toastId },
          )
        }
        return
      }

      if (receipt.status === 'success') {
        toast.success(
          <div>
            <div>{successMessage}</div>
            <ExplorerLink
              chain={chain}
              hashOrAddress={hash}
            />
          </div>,
          { id: toastId },
        )
      } else {
        toast.error(
          <div>
            <div>{errorMessage}</div>
            <ExplorerLink
              chain={chain}
              hashOrAddress={hash}
            />
          </div>,
          { id: toastId },
        )
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
    </TransactionContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTransactionNotification() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error(
      'useTransactionNotification must be used within a TransactionNotificationProvider',
    )
  }
  return context
}
