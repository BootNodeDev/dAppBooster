import { withWalletStatusVerifier } from '@/src/components/sharedComponents/WalletStatusVerifier'
import { useTransactionNotification } from '@/src/providers/TransactionNotificationProvider'
import { type ButtonProps, chakra } from '@chakra-ui/react'
import type { FC } from 'react'
import { useSignMessage } from 'wagmi'

interface SignButtonProps extends Omit<ButtonProps, 'onError'> {
  label?: string
  labelSigning?: string
  message: string
  onError?: (error: Error) => void
  onSign?: (signature: string) => void
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
const SignButton: FC<SignButtonProps> = withWalletStatusVerifier(
  ({
    children = 'Sign Message',
    disabled,
    labelSigning = 'Signing...',
    message,
    onError,
    onSign,
    ...restProps
  }: SignButtonProps) => {
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
  },
)

export default SignButton
