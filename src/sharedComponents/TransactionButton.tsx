import { ReactElement, useEffect, useState } from 'react'

import { Button } from 'db-ui-toolkit'
import { Chain, Hash, TransactionReceipt } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'

import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { ConnectWalletButton } from '@/src/providers/Web3Provider'

interface TransactionButtonProps {
  transaction: () => Promise<Hash>
  chain?: Chain
  onMined?: (receipt: TransactionReceipt) => void
  fallback?: ReactElement
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
 * @param {Function} props.fallback - The fallback component to be rendered when the wallet is not connected. (default: ConnectButton)
 * @param {Function} props.onMined - The callback function to be called when the transaction is mined.
 * @param {Chain} props.chain - The chain where the transaction will be sent.
 * @param {boolean} props.disabled - The flag to disable the button.
 * @param {string} props.label - The label for the button.
 * @param {string} props.labelSending - The label for the button when the transaction is pending.
 *
 * @returns {React.JSX} The transaction button component.
 */

export const TransactionButton = ({
  chain,
  disabled,
  fallback = <ConnectWalletButton />,
  label = 'Send Transaction',
  labelSending = 'Sending...',
  onMined,
  transaction,
}: TransactionButtonProps) => {
  const {
    isWalletConnected,
    isWalletNetworkSupported,
    supportedChains,
    switchChain,
    switchingChain,
    walletChainId,
  } = useWeb3Status()
  const [hash, setHash] = useState<Hash>()
  const [isPending, setIsPending] = useState<boolean>(false)

  const isCorrectChain = chain ? walletChainId === chain.id : isWalletNetworkSupported

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

  if (!isWalletConnected) {
    return fallback
  }

  const inputProps = {
    disabled: isPending || switchingChain || disabled,
    onClick: isCorrectChain
      ? handleSendTransaction
      : () => switchChain((chain || supportedChains[0]).id),
  }

  const buttonLabel = isPending
    ? labelSending
    : !isCorrectChain
      ? `Switch to ${(chain || supportedChains[0]).name}`
      : label

  return <Button {...inputProps}>{buttonLabel}</Button>
}
