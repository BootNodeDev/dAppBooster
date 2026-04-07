import type { FC, ReactElement, ReactNode } from 'react'
import SwitchChainButton from '@/src/wallet/components/SwitchChainButton'
import { ConnectWalletButton } from '@/src/wallet/providers'
import { useChainRegistry, useMultiWallet, useWallet } from '../hooks'

/** A single wallet requirement for multi-chain gating. */
export interface WalletRequirement {
  /** Resolve requirement by specific chain ID. */
  chainId?: string | number
  /** Resolve requirement by chain type (e.g. 'evm', 'svm'). */
  chainType?: string
  /** Human-readable label for fallback UI context. */
  label?: string
}

export interface WalletGuardProps {
  chainId?: string | number
  chainType?: string
  children?: ReactNode
  fallback?: ReactElement
  /**
   * Multi-chain requirements. When provided, the guard checks each requirement
   * and renders children only when all are met. Mutually exclusive with
   * top-level chainId/chainType props.
   */
  require?: WalletRequirement[]
  switchChainLabel?: string
}

/**
 * Gates content on wallet connection and correct chain.
 * Shows ConnectWalletButton when disconnected, SwitchChainButton when on wrong chain,
 * or renders children when ready.
 *
 * Supports two mutually exclusive modes:
 * - **Single-chain** (chainId/chainType props): uses useWallet for one adapter
 * - **Multi-chain** (require prop): uses useMultiWallet, checks each requirement
 *
 * @precondition Either `require` or `chainId`/`chainType` should be provided, not both
 * @postcondition Renders children only when all wallet requirements are satisfied
 * @throws Never — renders fallback UI instead of throwing
 */
export const WalletGuard: FC<WalletGuardProps> = (props) => {
  const { require: requirements, children } = props

  if (requirements && requirements.length > 0) {
    return <MultiChainGuard requirements={requirements}>{children}</MultiChainGuard>
  }

  return <SingleChainGuard {...props} />
}

/**
 * Internal component for single-chain wallet gating (original behavior).
 * @precondition useWallet hook is available via provider context
 * @postcondition Renders children when wallet is connected to the correct chain
 */
const SingleChainGuard: FC<WalletGuardProps> = ({
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

interface MultiChainGuardProps {
  requirements: WalletRequirement[]
  children?: ReactNode
}

/**
 * Internal component for multi-chain wallet gating.
 * Iterates requirements and renders fallback for the first unmet one.
 * @precondition useMultiWallet hook is available via provider context
 * @postcondition Renders children only when every requirement has a connected wallet
 */
const MultiChainGuard: FC<MultiChainGuardProps> = ({ requirements, children }) => {
  const { getWallet, getWalletByChainId } = useMultiWallet()
  const registry = useChainRegistry()

  for (const requirement of requirements) {
    const wallet =
      requirement.chainId !== undefined
        ? getWalletByChainId(requirement.chainId)
        : requirement.chainType !== undefined
          ? getWallet(requirement.chainType)
          : undefined

    if (!wallet || wallet.needsConnect) {
      return (
        <ConnectWalletButton
          chainId={requirement.chainId}
          chainType={requirement.chainType}
        />
      )
    }

    const requirementChainId = requirement.chainId
    if (wallet.needsChainSwitch && requirementChainId !== undefined) {
      const targetChain = registry.getChain(requirementChainId)
      return (
        <SwitchChainButton onClick={() => wallet.switchChain(requirementChainId)}>
          Switch to {targetChain?.name ?? String(requirementChainId)}
        </SwitchChainButton>
      )
    }
  }

  return children
}
