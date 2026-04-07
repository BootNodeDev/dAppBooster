import type { FC, ReactElement } from 'react'
import { createContext, useContext } from 'react'
import type { ChainsIds, RequiredNonNull } from '@/src/core/types'
import { DeveloperError } from '@/src/core/utils/DeveloperError'
import { useWalletStatus } from '../hooks/useWalletStatus'
import { useWeb3Status, type Web3Status } from '../hooks/useWeb3Status'
import { ConnectWalletButton } from '../providers'
import SwitchChainButton from './SwitchChainButton'

type ConnectedWeb3Status = RequiredNonNull<Web3Status>

const WalletStatusVerifierContext = createContext<ConnectedWeb3Status | null>(null)

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
 *
 * @deprecated Use {@link WalletGuard} from `@/src/sdk/react` instead.
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
  const web3Status = useWeb3Status()
  const { needsConnect, needsChainSwitch, targetChain, targetChainId, switchChain } =
    useWalletStatus({ chainId })

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
    <WalletStatusVerifierContext.Provider value={web3Status as ConnectedWeb3Status}>
      {children}
    </WalletStatusVerifierContext.Provider>
  )
}

/** Reads the connected Web3 status from WalletStatusVerifier context. */
const useWeb3StatusConnected = (): ConnectedWeb3Status => {
  const context = useContext(WalletStatusVerifierContext)
  if (context === null) {
    throw new DeveloperError('useWeb3StatusConnected must be used inside <WalletStatusVerifier>')
  }
  return context
}

export { useWeb3StatusConnected, WalletStatusVerifier }
