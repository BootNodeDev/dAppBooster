import type { FC, ReactElement, ReactNode } from 'react'
import SwitchChainButton from '@/src/wallet/components/SwitchChainButton'
import { ConnectWalletButton } from '@/src/wallet/providers'
import { useChainRegistry, useWallet } from '../hooks'

export interface WalletGuardProps {
  chainId?: string | number
  chainType?: string
  children?: ReactNode
  fallback?: ReactElement
  switchChainLabel?: string
}

/**
 * Gates content on wallet connection and correct chain.
 * Shows ConnectWalletButton when disconnected, SwitchChainButton when on wrong chain,
 * or renders children when ready.
 */
export const WalletGuard: FC<WalletGuardProps> = ({
  chainId,
  chainType,
  children,
  fallback = (
    <ConnectWalletButton
      chainId={chainId}
      chainType={chainType}
    />
  ),
  switchChainLabel = 'Switch to',
}) => {
  const wallet = useWallet({ chainId, chainType })
  const registry = useChainRegistry()

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

  return children
}
