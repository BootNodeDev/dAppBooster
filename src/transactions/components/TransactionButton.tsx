import type { ButtonProps } from '@chakra-ui/react'
import type { ReactElement } from 'react'
import { PrimaryButton } from '@/src/core/components'
import type { TransactionParams } from '@/src/sdk/core'
import type { TransactionLifecycle } from '@/src/sdk/core/lifecycle'
import { useChainRegistry, useTransaction, useWallet } from '@/src/sdk/react/hooks'
import { SwitchChainButton } from '@/src/wallet/components'
import { ConnectWalletButton } from '@/src/wallet/providers'

interface TransactionButtonProps extends ButtonProps {
  /** Transaction parameters. The chainId field drives wallet resolution. */
  params: TransactionParams
  /** Per-operation lifecycle hooks merged with global lifecycle. */
  lifecycle?: TransactionLifecycle
  /** Custom fallback when wallet needs connection. Defaults to ConnectWalletButton. */
  fallback?: ReactElement
  /** Button label during pending transaction. Defaults to 'Sending...'. */
  labelSending?: string
  /** Label for the switch chain button. Defaults to 'Switch to'. */
  switchChainLabel?: string
}

/**
 * Self-contained transaction button with wallet verification and submission.
 *
 * Shows a connect button if not connected, a switch chain button if on the wrong chain,
 * or the transaction button when ready.
 *
 * @example
 * ```tsx
 * <TransactionButton
 *   params={{ chainId: 1, payload: { to: '0x...', value: '0' } }}
 *   lifecycle={{ onConfirm: (result) => console.log('confirmed', result) }}
 * >
 *   Send ETH
 * </TransactionButton>
 * ```
 */
function TransactionButton({
  params,
  lifecycle,
  children = 'Send Transaction',
  disabled,
  fallback = <ConnectWalletButton chainId={params.chainId} />,
  labelSending = 'Sending...',
  switchChainLabel = 'Switch to',
  ...restProps
}: TransactionButtonProps) {
  const wallet = useWallet({ chainId: params.chainId })
  const { execute, phase } = useTransaction({ lifecycle })
  const registry = useChainRegistry()
  const isPending = phase !== 'idle'

  if (wallet.needsConnect) {
    return fallback
  }

  if (wallet.needsChainSwitch) {
    const targetChain = registry.getChain(params.chainId)
    return (
      <SwitchChainButton onClick={() => wallet.switchChain(params.chainId)}>
        {switchChainLabel} {targetChain?.name ?? String(params.chainId)}
      </SwitchChainButton>
    )
  }

  const handleClick = async () => {
    try {
      await execute(params)
    } catch {
      // Error already set in hook state and onError lifecycle fired.
      // Swallow re-throw to prevent unhandled promise rejection.
    }
  }

  return (
    <PrimaryButton
      disabled={isPending || disabled}
      onClick={handleClick}
      {...restProps}
    >
      {isPending ? labelSending : children}
    </PrimaryButton>
  )
}

export default TransactionButton
