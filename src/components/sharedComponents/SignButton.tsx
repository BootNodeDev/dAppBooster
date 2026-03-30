import SwitchChainButton from '@/src/components/sharedComponents/ui/SwitchChainButton'
import { useWalletStatus } from '@/src/hooks/useWalletStatus'
import type { ChainsIds } from '@/src/lib/networks.config'
import { useTransactionNotification } from '@/src/providers/TransactionNotificationProvider'
import { ConnectWalletButton } from '@/src/providers/Web3Provider'
import { type ButtonProps, chakra } from '@chakra-ui/react'
import type { FC, ReactElement } from 'react'
import { useSignMessage } from 'wagmi'

interface SignButtonProps extends Omit<ButtonProps, 'onError'> {
  chainId?: ChainsIds
  fallback?: ReactElement
  label?: string
  labelSigning?: string
  message: string
  onError?: (error: Error) => void
  onSign?: (signature: string) => void
  switchChainLabel?: string
}

/**
 * SignButton component that allows users to sign a message.
 *
 * @param {SignButtonProps} props - SignButton component props.
 * @param {string} props.message - The message to sign.
 * @param {string|ReactNode} [props.children='Sign Message'] - The content to display in the button.
 * @param {boolean} [props.disabled] - Whether the button is disabled.
 * @param {(signature: string) => void} [props.onSign] - Callback function called when the message is signed.
 * @param {(error: Error) => void} [props.onError] - Callback function called when an error occurs.
 * @param {string} [props.label='Sign Message'] - The label for the button (alternative to children).
 * @param {string} [props.labelSigning='Signing...'] - The label for the button when the message is being signed.
 * @param {ChainsIds} [props.chainId] - Target chain ID for wallet status verification.
 * @param {ReactElement} [props.fallback] - Custom fallback when wallet needs connect.
 * @param {string} [props.switchChainLabel='Switch to'] - Label for the switch chain button.
 * @param {ButtonProps} [props.restProps] - Additional props inherited from Chakra UI ButtonProps.
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
  const { needsConnect, needsChainSwitch, targetChain, switchChain } = useWalletStatus({ chainId })
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
      <SwitchChainButton onClick={() => switchChain(targetChain.id as ChainsIds)}>
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
