import { type FC } from 'react'

import { Button } from 'db-ui-toolkit'
import { useSignMessage } from 'wagmi'

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
 *
 * @param {string} message - The message to sign
 * @param {boolean} [disabled] - The flag to disable the button
 * @param {Function} [onSign] - The callback function to be called when the message is signed
 * @param {Function} [onError] - The callback function to be called when an error occurs
 * @param {string} [label='Sign Message'] - The label for the button
 * @param {string} [labelSigning='Signing...'] - The label for the button when the message is signing
 *
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
const SignButton: FC<SignButtonProps> = withWalletStatusVerifier(
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
      <Button
        $variant="primary"
        disabled={disabled || isPending}
        onClick={() => signMessage({ message })}
      >
        {isPending ? labelSigning : label}
      </Button>
    )
  },
)

export default SignButton
