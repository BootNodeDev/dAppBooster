import { useEffect, useState } from 'react'

import { Button } from 'db-ui-toolkit'
import { Chain, Hash, TransactionReceipt } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'

import { useWeb3StatusConnected } from '@/src/hooks/useWeb3Status'

interface TransactionButtonProps {
  transaction: () => Promise<Hash>
  chain?: Chain
  onMined?: (receipt: TransactionReceipt) => void
  disabled?: boolean
  label?: string
  labelSending?: string
}

/**
 * Transaction button component.
 * Use with writeContractSync or sendTransactionSync function to handle the transaction and wait for it.
 * Use fallback prop to render a different component when the wallet is not connected.
 *
 * @component
 * @param {Function} props.transaction - The function that initiates the transaction.
 * @param {Chain} props.chain - The chain where the transaction will be sent.
 * @param {Function} props.onMined - The callback function to be called when the transaction is mined.
 * @param {boolean} props.disabled - The flag to disable the button.
 * @param {string} props.label - The label for the button.
 * @param {string} props.labelSending - The label for the button when the transaction is pending.
 *
 * @returns {React.JSX} The transaction button component.
 */

export const TransactionButton = ({
  disabled,
  label = 'Send Transaction',
  labelSending = 'Sending...',
  onMined,
  transaction,
}: TransactionButtonProps) => {
  const { isWalletSynced } = useWeb3StatusConnected()

  if (!isWalletSynced) {
    throw new Error(
      'TransactionButton component must be used inside a WalletStatusVerifier component or withWalletStatusVerifier HoC',
    )
  }

  const [hash, setHash] = useState<Hash>()
  const [isPending, setIsPending] = useState<boolean>(false)

  const { data: receipt } = useWaitForTransactionReceipt({
    hash: hash,
  })

  useEffect(() => {
    if (receipt && isPending) {
      setIsPending(false)
      setHash(undefined)
      onMined?.(receipt)
    }
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

  return <Button {...inputProps}>{isPending ? labelSending : label}</Button>
}
