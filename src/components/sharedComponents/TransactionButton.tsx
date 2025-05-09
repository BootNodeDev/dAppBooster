import { withWalletStatusVerifier } from '@/src/components/sharedComponents/WalletStatusVerifier'
import PrimaryButton from '@/src/components/sharedComponents/ui/PrimaryButton'
import { useTransactionNotification } from '@/src/providers/TransactionNotificationProvider'
import type { ButtonProps } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import type { Hash, TransactionReceipt } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'

interface TransactionButtonProps extends ButtonProps {
  confirmations?: number
  labelSending?: string
  onMined?: (receipt: TransactionReceipt) => void
  transaction: {
    (): Promise<Hash>
    methodId?: string
  }
}

/**
 * TransactionButton component that handles blockchain transaction submission and monitoring.
 *
 * Integrates with writeContractSync or sendTransactionSync functions to handle transaction
 * submission and wait for confirmation. Displays transaction status and calls the onMined
 * callback when the transaction is confirmed.
 *
 * @param {TransactionButtonProps} props - TransactionButton component props.
 * @param {() => Promise<Hash>} props.transaction - Function that initiates the transaction.
 * @param {(receipt: TransactionReceipt) => void} [props.onMined] - Callback function called when transaction is mined.
 * @param {boolean} [props.disabled] - Whether the button is disabled.
 * @param {string} [props.labelSending='Sending...'] - Button label during pending transaction.
 * @param {number} [props.confirmations=1] - Number of confirmations to wait for.
 * @param {ReactNode} [props.children='Send Transaction'] - Button content.
 * @param {ButtonProps} props.restProps - Additional props inherited from Chakra UI ButtonProps.
 *
 * @example
 * ```tsx
 * <TransactionButton
 *   transaction={sendEthTransaction}
 *   onMined={(receipt) => console.log("Transaction confirmed:", receipt)}
 *   labelSending="Processing..."
 *   confirmations={3}
 * >
 *   Send ETH
 * </TransactionButton>
 * ```
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
      <PrimaryButton
        disabled={isPending || disabled}
        onClick={handleSendTransaction}
        {...restProps}
      >
        {isPending ? labelSending : children}
      </PrimaryButton>
    )
  },
)

export default TransactionButton
