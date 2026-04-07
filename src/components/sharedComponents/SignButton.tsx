import { type ButtonProps, chakra } from '@chakra-ui/react'
import type { FC, ReactElement } from 'react'
import { useState } from 'react'
import SwitchChainButton from '@/src/components/sharedComponents/ui/SwitchChainButton'
import { useChainRegistry, useWallet } from '@/src/sdk/react/hooks'
import { ConnectWalletButton } from '@/src/wallet/providers'

interface SignButtonProps extends Omit<ButtonProps, 'onError'> {
  /** Target chain ID for wallet status verification. */
  chainId?: string | number
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
  const wallet = useWallet({ chainId })
  const registry = useChainRegistry()
  const [isPending, setIsPending] = useState(false)

  if (wallet.needsConnect) {
    return fallback
  }

  if (wallet.needsChainSwitch && chainId !== undefined) {
    const targetChain = registry.getChain(chainId)
    return (
      <SwitchChainButton onClick={() => wallet.switchChain(chainId)}>
        {switchChainLabel} {targetChain?.name ?? String(chainId)}
      </SwitchChainButton>
    )
  }

  const handleSign = async () => {
    setIsPending(true)
    try {
      const result = await wallet.signMessage({ message })
      onSign?.(result.signature)
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      onError?.(errorObj)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <chakra.button
      disabled={disabled || isPending}
      onClick={handleSign}
      {...restProps}
    >
      {isPending ? labelSigning : children}
    </chakra.button>
  )
}

export default SignButton
