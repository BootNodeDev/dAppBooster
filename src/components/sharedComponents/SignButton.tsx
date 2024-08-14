import { ComponentProps, type FC } from 'react'

import { useSignMessage } from 'wagmi'

import { withWalletStatusVerifier } from '@/src/components/sharedComponents/WalletStatusVerifier'

interface SignButtonPropsProps extends Omit<ComponentProps<'button'>, 'onError'> {
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
const SignButton: FC<SignButtonPropsProps> = withWalletStatusVerifier(
  ({
    children = 'Sign Message',
    disabled,
    labelSigning = 'Signing...',
    message,
    onError,
    onSign,
    ...restProps
  }) => {
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
      <button
        disabled={disabled || isPending}
        onClick={() => signMessage({ message })}
        {...restProps}
      >
        {isPending ? labelSigning : children}
      </button>
    )
  },
)

export default SignButton
