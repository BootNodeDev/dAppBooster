import { type ButtonProps, chakra } from '@chakra-ui/react'
import type { FC, ReactElement } from 'react'
import { useSignMessage } from 'wagmi'
import SwitchChainButton from '@/src/components/sharedComponents/ui/SwitchChainButton'
import { useWalletStatus } from '@/src/hooks/useWalletStatus'
import type { ChainsIds } from '@/src/lib/networks.config'
import { useTransactionNotification } from '@/src/providers/TransactionNotificationProvider'
import { ConnectWalletButton } from '@/src/providers/Web3Provider'

interface SignButtonProps extends Omit<ButtonProps, 'onError'> {
  /** Target chain ID for wallet status verification. */
  chainId?: ChainsIds
  /** Custom fallback when wallet needs connection. Defaults to ConnectWalletButton. */
  fallback?: ReactElement
  /** Button label while signing. Defaults to 'Signing...'. */
  labelSigning?: string
  /** The message to sign. */
  message: string
  /** Callback function called when an error occurs. */
  onError?: (error: Error) => void
  /** Callback function called when the message is signed. */
  onSign?: (signature: string) => void
  /** Label for the switch chain button. Defaults to 'Switch to'. */
  switchChainLabel?: string
}

/**
 * Self-contained message signing button with wallet verification.
 *
 * Handles wallet connection status internally — shows a connect button if not connected,
 * a switch chain button if on the wrong chain, or the sign button when ready.
 *
 * @example
 * ```tsx
 * <SignButton
 *   message="Hello, world!"
 *   onError={(error) => console.error(error)}
 *   onSign={(signature) => console.log(signature)}
 * />
 * ```
 */
const SignButton: FC<SignButtonProps> = ({
  chainId,
  children = 'Sign Message',
  disabled,
  fallback = <ConnectWalletButton />,
  labelSigning = 'Signing...',
  message,
  onError,
  onSign,
  switchChainLabel = 'Switch to',
  ...restProps
}) => {
  const { needsConnect, needsChainSwitch, targetChain, targetChainId, switchChain } =
    useWalletStatus({ chainId })
  const { watchSignature } = useTransactionNotification()

  const { isPending, signMessageAsync } = useSignMessage({
    mutation: {
      onSuccess(data) {
        onSign?.(data)
      },
      onError(error) {
        onError?.(error)
      },
    },
  })

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

  return (
    <chakra.button
      disabled={disabled || isPending}
      onClick={() => {
        watchSignature({
          message: 'Signing message...',
          signaturePromise: signMessageAsync({ message }),
        })
      }}
      {...restProps}
    >
      {isPending ? labelSigning : children}
    </chakra.button>
  )
}

export default SignButton
