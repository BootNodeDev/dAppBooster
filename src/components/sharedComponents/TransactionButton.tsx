import { type ComponentProps, useEffect, useState } from 'react'

import type { Hash, TransactionReceipt } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'

import { withWalletStatusVerifier } from '@/src/components/sharedComponents/WalletStatusVerifier'
import { useTransactionNotification } from '@/src/lib/toast/TransactionNotificationProvider'

interface TransactionButtonProps extends ComponentProps<'button'> {
  confirmations?: number
  labelSending?: string
  onMined?: (receipt: TransactionReceipt) => void
  transaction: {
    (): Promise<Hash>
    methodId?: string
  }
}

/**
 * TransactionButton component.
 * Use with writeContractSync or sendTransactionSync function to handle the transaction and wait for it.
 * The component will call the onMined callback function when the transaction is mined.
 *
 * @param {TransactionButtonProps} props - TransactionButton component props.
 * @param {Function} props.transaction - The function that initiates the transaction.
 * @param {Function} props.onMined - The callback function to be called when the transaction is mined.
 * @param {boolean} props.disabled - The flag to disable the button.
 * @param {string} props.labelSending - The label for the button when the transaction is pending.
 * @param {number} props.confirmations - The number of confirmations to wait for the transaction.
 *
 * @returns The transaction button component.
 */

const TransactionButton = withWalletStatusVerifier<TransactionButtonProps>(
  ({
    children = 'Send Transaction',
    confirmations = 1,
    disabled,
    labelSending = 'Sending...',
    onMined,
    transaction,
    ...restProps
  }) => {
    const [hash, setHash] = useState<Hash>()
    const [isPending, setIsPending] = useState<boolean>(false)

    const { watchTx } = useTransactionNotification()
    const { data: receipt } = useWaitForTransactionReceipt({
      hash: hash,
      confirmations,
    })

    useEffect(() => {
      const handleMined = async () => {
        if (receipt && isPending) {
          await onMined?.(receipt)
          setIsPending(false)
          setHash(undefined)
        }
      }

      handleMined()
    }, [isPending, onMined, receipt])

    const handleSendTransaction = async () => {
      setIsPending(true)
      try {
        const txPromise = transaction()
        watchTx({ txPromise, methodId: transaction.methodId })
        const hash = await txPromise
        setHash(hash)
      } catch (error: unknown) {
        console.error('Error sending transaction', error instanceof Error ? error.message : error)
        setIsPending(false)
      }
    }

    return (
      <button
        disabled={isPending || disabled}
        onClick={handleSendTransaction}
        {...restProps}
      >
        {isPending ? labelSending : children}
      </button>
    )
  },
)

export default TransactionButton
