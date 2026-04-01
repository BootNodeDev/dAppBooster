import SwitchChainButton from '@/src/components/sharedComponents/ui/SwitchChainButton'
import { useWalletStatus } from '@/src/hooks/useWalletStatus'
import { type Web3Status, useWeb3Status } from '@/src/hooks/useWeb3Status'
import type { ChainsIds } from '@/src/lib/networks.config'
import { ConnectWalletButton } from '@/src/providers/Web3Provider'
import type { RequiredNonNull } from '@/src/types/utils'
import { DeveloperError } from '@/src/utils/DeveloperError'
import { type FC, type ReactElement, createContext, useContext } from 'react'

const WalletStatusVerifierContext = createContext<RequiredNonNull<Web3Status> | null>(null)

/**
 * Returns the connected wallet's Web3 status.
 *
 * Must be called inside a `<WalletStatusVerifier>` component tree.
 * Throws if called outside one.
 */
export const useWeb3StatusConnected = () => {
  const context = useContext(WalletStatusVerifierContext)
  if (context === null) {
    throw new DeveloperError(
      'useWeb3StatusConnected must be used inside a <WalletStatusVerifier> component.',
    )
  }
  return context
}

interface WalletStatusVerifierProps {
  chainId?: ChainsIds
  children?: ReactElement
  fallback?: ReactElement
  switchChainLabel?: string
}

/**
 * Wrapper component that gates content on wallet connection and chain status.
 *
 * This is the primary API for protecting UI that requires a connected wallet.
 * Components that call `useWeb3StatusConnected` must be rendered inside this component.
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
  switchChainLabel = 'Switch to',
}: WalletStatusVerifierProps) => {
  const { needsConnect, needsChainSwitch, targetChain, targetChainId, switchChain } =
    useWalletStatus({ chainId })
  const web3Status = useWeb3Status()

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
    <WalletStatusVerifierContext.Provider value={web3Status as RequiredNonNull<Web3Status>}>
      {children}
    </WalletStatusVerifierContext.Provider>
  )
}

export { WalletStatusVerifier }
