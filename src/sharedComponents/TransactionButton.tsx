import { HTMLProps, ReactElement, useEffect, useState } from 'react'

import { Button } from 'db-ui-toolkit'
import { Hash, TransactionReceipt } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'

import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { ConnectWalletButton } from '@/src/providers/Web3Provider'

interface TransactionButtonProps {
  transaction: () => Promise<Hash>
  renderButton?: (props: HTMLProps<HTMLButtonElement>) => ReactElement
  onMined?: (receipt: TransactionReceipt) => void
  disabled?: boolean
  label?: string
}

/**
 * Transaction button component.
 * Use with writeContractSync or sendTransactionSync function to handle the transaction and wait for it.
 * If the wallet is not connected, it renders a connect wallet button.
 *
 * @component
 * @param {Function} props.transaction - The function that initiates the transaction.
 * @param {Function} props.renderButton - The function that renders the custom button component.
 * @param {Function} props.onMined - The callback function to be called when the transaction is mined.
 * @param {boolean} props.disabled - The flag to disable the button.
 * @param {string} props.label - The label for the button.
 *
 * @returns {React.JSX} The transaction button component.
 */

export const TransactionButton = ({
  disabled,
  label = 'Send Transaction',
  onMined,
  renderButton,
  transaction,
}: TransactionButtonProps) => {
  const { isWalletConnected } = useWeb3Status()
  const [hash, setHash] = useState<Hash | undefined>(undefined)
  const [isPending, setIsPending] = useState<boolean>(false)

  const { data: receipt } = useWaitForTransactionReceipt({
    hash: hash,
  })

  useEffect(() => {
    if (receipt && isPending) {
      setIsPending(false)
      setHash(undefined)
      if (onMined) {
        onMined(receipt)
      }
    }
  }, [isPending, onMined, receipt])

  const handleSendTransaction = async () => {
    setIsPending(true)
    try {
      const hash = await transaction()
      setHash(hash)
    } catch (error: any) {
      console.error('Error sending transaction', error.message)
      setIsPending(false)
    }
  }

  // Connect wallet button if wallet is not connected
  // TODO: should add this validation here? or we can assume that the button will be rendered only if the wallet is connected?
  if (!isWalletConnected) {
    return <ConnectWalletButton label="Connect your wallet" />
  }

  const inputProps = {
    disabled: isPending || disabled,
    onClick: handleSendTransaction,
  }

  return renderButton ? renderButton({ ...inputProps }) : <Button {...inputProps}>{label}</Button>
}
