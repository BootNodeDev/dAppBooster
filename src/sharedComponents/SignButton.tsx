import { useSignMessage } from 'wagmi'

import { PrimaryButton } from '@/src/sharedComponents/Buttons'
import { withWalletStatusVerifier } from '@/src/sharedComponents/WalletStatusVerifier'

interface SignButtonProps {
  message: string
  disabled?: boolean
  onSign?: (signature: string) => void
  onError?: (error: Error) => void
  label?: string
  labelSigning?: string
}

/**
 * SignButton component that allows users to sign a message.
 *
 * @param {SignButtonProps} props - SignButton component props.
 * @param {string} props.message - The message to sign
 * @param {boolean} [props.disabled] - The flag to disable the button
 * @param {Function} [props.onSign] - The callback function to be called when the message is signed
 * @param {Function} [props.onError] - The callback function to be called when an error occurs
 * @param {string} [props.label='Sign Message'] - The label for the button
 * @param {string} [props.labelSigning='Signing...'] - The label for the button when the message is signing
 *
 * @example
 * ```tsx
 * <SignButton
 *   message="Hello, world!"
 *   onError={(error) => console.error(error)}
 *   onSign={(signature) => console.log(data)}
 * />
 * ```
 */
const SignButton = withWalletStatusVerifier<SignButtonProps>(
  ({
    disabled,
    label = 'Sign Message',
    labelSigning = 'Signing...',
    message,
    onError,
    onSign,
  }: SignButtonProps) => {
    const { isPending, signMessage } = useSignMessage({
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
      <PrimaryButton disabled={disabled || isPending} onClick={() => signMessage({ message })}>
        {isPending ? labelSigning : label}
      </PrimaryButton>
    )
  },
)

export default SignButton
