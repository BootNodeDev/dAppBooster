import type { FC, ReactNode } from 'react'
import {
  WalletGuard as HeadlessWalletGuard,
  type WalletRequirement,
} from '@/src/sdk/react/components/WalletGuard'
import SwitchChainButton from '@/src/wallet/components/SwitchChainButton'
import { ConnectWalletButton } from './ConnectWalletButton'

interface ChakraWalletGuardProps {
  chainId?: string | number
  chainType?: string
  children?: ReactNode
  require?: WalletRequirement[]
  switchChainLabel?: string
}

/**
 * Chakra-styled WalletGuard.
 *
 * Composes the headless WalletGuard with Chakra-styled ConnectWalletButton
 * and SwitchChainButton as default render props.
 */
export const WalletGuard: FC<ChakraWalletGuardProps> = ({
  chainId,
  chainType,
  children,
  require: requirements,
  switchChainLabel = 'Switch to',
}) => {
  return (
    <HeadlessWalletGuard
      chainId={chainId}
      chainType={chainType}
      require={requirements}
      renderConnect={() => (
        <ConnectWalletButton
          chainId={chainId}
          chainType={chainType}
        />
      )}
      renderSwitchChain={({ chainName, onSwitch }) => (
        <SwitchChainButton onClick={onSwitch}>
          {switchChainLabel} {chainName}
        </SwitchChainButton>
      )}
    >
      {children}
    </HeadlessWalletGuard>
  )
}
