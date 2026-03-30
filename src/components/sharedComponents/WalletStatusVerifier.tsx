import SwitchChainButton from '@/src/components/sharedComponents/ui/SwitchChainButton'
import { useWalletStatus } from '@/src/hooks/useWalletStatus'
import type { ChainsIds } from '@/src/lib/networks.config'
import { ConnectWalletButton } from '@/src/providers/Web3Provider'
import type { FC, ReactElement } from 'react'

interface WalletStatusVerifierProps {
  chainId?: ChainsIds
  children?: ReactElement
  fallback?: ReactElement
  labelSwitchChain?: string
}

/**
 * Wrapper component that gates content on wallet connection and chain status.
 *
 * This is the primary API for protecting UI that requires a connected wallet.
 *
 * @example
 * ```tsx
 * <WalletStatusVerifier>
 *   <MyProtectedComponent />
 * </WalletStatusVerifier>
 * ```
 */
const WalletStatusVerifier: FC<WalletStatusVerifierProps> = ({
  chainId,
  children,
  fallback = <ConnectWalletButton />,
  labelSwitchChain = 'Switch to',
}: WalletStatusVerifierProps) => {
  const { needsConnect, needsChainSwitch, targetChain, targetChainId, switchChain } =
    useWalletStatus({ chainId })

  if (needsConnect) {
    return fallback
  }

  if (needsChainSwitch) {
    return (
      <SwitchChainButton onClick={() => switchChain(targetChainId)}>
        {labelSwitchChain} {targetChain.name}
      </SwitchChainButton>
    )
  }

  return children
}

export { WalletStatusVerifier }
