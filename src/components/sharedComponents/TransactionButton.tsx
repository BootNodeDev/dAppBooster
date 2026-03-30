import PrimaryButton from '@/src/components/sharedComponents/ui/PrimaryButton'
import SwitchChainButton from '@/src/components/sharedComponents/ui/SwitchChainButton'
import { useWalletStatus } from '@/src/hooks/useWalletStatus'
import type { ChainsIds } from '@/src/lib/networks.config'
import { useTransactionNotification } from '@/src/providers/TransactionNotificationProvider'
import { ConnectWalletButton } from '@/src/providers/Web3Provider'
import type { ButtonProps } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import type { Hash, TransactionReceipt } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'

interface TransactionButtonProps extends ButtonProps {
  /** Target chain ID for wallet status verification. */
  chainId?: ChainsIds
  /** Number of confirmations to wait for. Defaults to 1. */
  confirmations?: number
  /** Custom fallback when wallet needs connection. Defaults to ConnectWalletButton. */
  fallback?: ReactElement
  /** Button label during pending transaction. Defaults to 'Sending...'. */
  labelSending?: string
  /** Callback function called when transaction is mined. */
  onMined?: (receipt: TransactionReceipt) => void
  /** Label for the switch chain button. Defaults to 'Switch to'. */
  switchChainLabel?: string
  /** Function that initiates the transaction and returns a hash. */
  transaction: {
    (): Promise<Hash>
    methodId?: string
  }
}

/**
 * Self-contained transaction button with wallet verification, submission, and confirmation tracking.
 *
 * Handles wallet connection status internally — shows a connect button if not connected,
 * a switch chain button if on the wrong chain, or the transaction button when ready.
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
function TransactionButton({
  chainId,
  children = 'Send Transaction',
  confirmations = 1,
  disabled,
  fallback = <ConnectWalletButton />,
  labelSending = 'Sending...',
  onMined,
  switchChainLabel = 'Switch to',
  transaction,
  ...restProps
}: TransactionButtonProps) {
  const { needsConnect, needsChainSwitch, targetChain, switchChain } = useWalletStatus({ chainId })

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

  if (needsConnect) {
    return fallback
  }

  if (needsChainSwitch) {
    return (
      <SwitchChainButton onClick={() => switchChain(targetChain.id as ChainsIds)}>
        {switchChainLabel} {targetChain.name}
      </SwitchChainButton>
    )
  }

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
}

export default TransactionButton
