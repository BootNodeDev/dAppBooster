/**
 * @deprecated Legacy TransactionButton that uses wagmi hooks directly.
 * Migrate to the new adapter-based TransactionButton with `params` + `lifecycle` props.
 */

import type { ButtonProps } from '@chakra-ui/react'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import type { Hash, TransactionReceipt } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import { PrimaryButton } from '@/src/core/components'
import type { ChainsIds } from '@/src/core/types'
import { useTransactionNotification } from '@/src/transactions/providers'
import SwitchChainButton from '@/src/wallet/components/SwitchChainButton'
import { useWalletStatus } from '@/src/wallet/hooks'
import { ConnectWalletButton } from '@/src/wallet/providers'

interface LegacyTransactionButtonProps extends ButtonProps {
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
 * @deprecated Use the adapter-based TransactionButton instead.
 */
function LegacyTransactionButton({
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
}: LegacyTransactionButtonProps) {
  const { needsConnect, needsChainSwitch, targetChain, targetChainId, switchChain } =
    useWalletStatus({ chainId })

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
      <SwitchChainButton onClick={() => switchChain(targetChainId)}>
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

export default LegacyTransactionButton
