import type { FC, ReactElement, ReactNode } from 'react'
import type { WalletAdapter } from '../../core/adapters/wallet'
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

/** Props passed to the renderSwitchChain render prop. */
export interface SwitchChainRenderProps {
  chainId: string | number
  chainName: string
  onSwitch: () => void
}

export interface WalletGuardProps {
  chainId?: string | number
  chainType?: string
  /**
   * Level 4 escape hatch: explicit wallet adapter — bypasses provider resolution.
   * Only applies in single-chain mode (not with `require` prop).
   * @expects if adapter provided, require must not be set (single-chain mode only)
   */
  adapter?: WalletAdapter
  children?: ReactNode
  /**
   * Multi-chain requirements. When provided, the guard checks each requirement
   * and renders children only when all are met. Mutually exclusive with
   * top-level chainId/chainType props.
   */
  require?: WalletRequirement[]
  /** Render prop for the connect wallet UI. Called when wallet needs connection. */
  renderConnect?: () => ReactElement
  /** Render prop for the switch chain UI. Called when wallet is on wrong chain. */
  renderSwitchChain?: (props: SwitchChainRenderProps) => ReactElement
  switchChainLabel?: string
}

/**
 * Gates content on wallet connection and correct chain.
 * Headless component: uses render props for connect/switch UI.
 * Returns null when no render prop is provided for the needed state.
 *
 * Supports two mutually exclusive modes:
 * - **Single-chain** (chainId/chainType props): uses useWallet for one adapter
 * - **Multi-chain** (require prop): uses useMultiWallet, checks each requirement
 *
 * @expects Either `require` or `chainId`/`chainType` should be provided, not both
 * @postcondition Renders children only when all wallet requirements are satisfied
 * @throws Never — renders fallback UI or null instead of throwing
 */
export const WalletGuard: FC<WalletGuardProps> = (props) => {
  const { require: requirements, children } = props

  if (requirements && requirements.length > 0) {
    return (
      <MultiChainGuard
        {...props}
        requirements={requirements}
      >
        {children}
      </MultiChainGuard>
    )
  }

  return <SingleChainGuard {...props} />
}

/**
 * Internal component for single-chain wallet gating (original behavior).
 * @expects useWallet hook is available via provider context
 * @postcondition Renders children when wallet is connected to the correct chain
 */
const SingleChainGuard: FC<WalletGuardProps> = ({
  chainId,
  chainType,
  adapter,
  children,
  renderConnect,
  renderSwitchChain,
}) => {
  const wallet = useWallet({ chainId, chainType, adapter })
  const registry = useChainRegistry()

  if (wallet.needsConnect) {
    if (renderConnect) {
      return renderConnect()
    }
    return null
  }

  if (wallet.needsChainSwitch && chainId !== undefined) {
    if (renderSwitchChain) {
      const targetChain = registry.getChain(chainId)
      const chainName = targetChain?.name ?? String(chainId)
      return renderSwitchChain({
        chainId,
        chainName,
        onSwitch: () => wallet.switchChain(chainId),
      })
    }
    return null
  }

  return children
}

interface MultiChainGuardProps extends WalletGuardProps {
  requirements: WalletRequirement[]
  children?: ReactNode
}

/**
 * Internal component for multi-chain wallet gating.
 * Iterates requirements and renders fallback for the first unmet one.
 * @expects useMultiWallet hook is available via provider context
 * @postcondition Renders children only when every requirement has a connected wallet
 */
const MultiChainGuard: FC<MultiChainGuardProps> = ({
  requirements,
  children,
  renderConnect,
  renderSwitchChain,
}) => {
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
      if (renderConnect) {
        return renderConnect()
      }
      return null
    }

    const requirementChainId = requirement.chainId
    if (wallet.needsChainSwitch && requirementChainId !== undefined) {
      if (renderSwitchChain) {
        const targetChain = registry.getChain(requirementChainId)
        const chainName = targetChain?.name ?? String(requirementChainId)
        return renderSwitchChain({
          chainId: requirementChainId,
          chainName,
          onSwitch: () => wallet.switchChain(requirementChainId),
        })
      }
      return null
    }
  }

  return children
}
