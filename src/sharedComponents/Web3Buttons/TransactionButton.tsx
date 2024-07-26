import { useEffect, useState } from 'react'

import { Button } from 'db-ui-toolkit'
import { type Hash, type TransactionReceipt } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'

import { withWalletStatusVerifier } from '@/src/sharedComponents/WalletStatusVerifier'

interface TransactionButtonProps {
  transaction: () => Promise<Hash>
  onMined?: (receipt: TransactionReceipt) => any
  disabled?: boolean
  label?: string
  labelSending?: string
  confirmations?: number
}

/**
 * TransactionButton component.
 * Use with writeContractSync or sendTransactionSync function to handle the transaction and wait for it.
 * The component will call the onMined callback function when the transaction is mined.
 *
 * @component
 * @param {Function} props.transaction - The function that initiates the transaction.
 * @param {Function} props.onMined - The callback function to be called when the transaction is mined.
 * @param {boolean} props.disabled - The flag to disable the button.
 * @param {string} props.label - The label for the button.
 * @param {string} props.labelSending - The label for the button when the transaction is pending.
 * @param {number} props.confirmations - The number of confirmations to wait for the transaction.
 *
 * @returns The transaction button component.
 */

const TransactionButton = withWalletStatusVerifier(
  ({
    confirmations = 1,
    disabled,
    label = 'Send Transaction',
    labelSending = 'Sending...',
    onMined,
    transaction,
  }: TransactionButtonProps) => {
    const [hash, setHash] = useState<Hash>()
    const [isPending, setIsPending] = useState<boolean>(false)

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
        const hash = await transaction()
        setHash(hash)
      } catch (error: unknown) {
        console.error('Error sending transaction', error instanceof Error ? error.message : error)
        setIsPending(false)
      }
    }

    const inputProps = {
      disabled: isPending || disabled,
      onClick: handleSendTransaction,
    }

    return (
      <Button $variant="primary" {...inputProps}>
        {isPending ? labelSending : label}
      </Button>
    )
  },
)

export default TransactionButton
