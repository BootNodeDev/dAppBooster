import { type ComponentType, type FC, type ReactElement } from 'react'

import { Button } from 'db-ui-toolkit'
import { extractChain } from 'viem'

import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { chains, type ChainsIds } from '@/src/lib/networks.config'
import { ConnectWalletButton } from '@/src/providers/Web3Provider'

interface WalletStatusVerifierProps {
  chainId?: ChainsIds
  fallback?: ReactElement
  children?: ReactElement
  labelSwitchChain?: string
}

/**
 * WalletStatusVerifier Component
 *
 * This component checks the wallet connection and chain synchronization status.
 * If the wallet is not connected, it displays a fallback component (default: ConnectWalletButton)
 * If the wallet is connected but not synced with the correct chain, it provides an option to switch chain.
 *
 * @param {Object} props - WalletStatusVerifier component props
 * @param {Chain['id']} [props.chainId] - The chain ID to check for synchronization
 * @param {ReactElement} [props.fallback] - The fallback component to render if the wallet is not connected
 * @param {ReactElement} props.children - The children components to render if the wallet is connected and synced
 *
 * @example
 * ```tsx
 * <WalletStatusVerifier>
 *  <AComponentThatRequiresAConnectedWallet />
 * </WalletStatusVerifier>
 * ```
 */
const WalletStatusVerifier: FC<WalletStatusVerifierProps> = ({
  chainId,
  children,
  fallback = <ConnectWalletButton />,
  labelSwitchChain = 'Switch to',
}) => {
  const { appChainId, isWalletConnected, isWalletSynced, switchChain, walletChainId } =
    useWeb3Status()

  const chainToSwitch = extractChain({ chains, id: chainId || appChainId || chains[0].id })

  if (!isWalletConnected) {
    return fallback
  }

  if (!isWalletSynced || walletChainId !== chainToSwitch.id) {
    return (
      <Button onClick={() => switchChain(chainToSwitch.id)}>
        {labelSwitchChain} {chainToSwitch?.name}
      </Button>
    )
  }

  return children
}

/**
 * WalletStatusVerifier HOC
 *
 *
 * @param {Object} props - HOC props
 * @param {Chain['id']} [props.chainId] - The chain ID to check for synchronization
 * @param {ReactElement} [props.fallback] - The fallback component to render if the wallet is not connected
 * @param {ReactElement} WrappedComponent - The component to render if the wallet is connected and synced
 * @example
 * const ComponentWithConection = withWalletStatusVerifier(MyComponent);
 * @returns {FC} The WalletStatusVerifier HOC
 */
const withWalletStatusVerifier = <P extends object>(
  WrappedComponent: ComponentType<P>,
  {
    chainId,
    fallback = <ConnectWalletButton />,
    labelSwitchChain = 'Switch to',
  }: WalletStatusVerifierProps = {},
): FC<P> => {
  const ComponentWithVerifier: FC<P> = (props: P) => {
    const { appChainId, isWalletConnected, isWalletSynced, switchChain, walletChainId } =
      useWeb3Status()

    const chainToSwitch = extractChain({ chains, id: chainId || appChainId || chains[0].id })

    if (!isWalletConnected) {
      return fallback
    }

    if (!isWalletSynced || walletChainId !== chainToSwitch.id) {
      return (
        <Button $variant="primary" onClick={() => switchChain(chainToSwitch.id)}>
          {labelSwitchChain} {chainToSwitch?.name}
        </Button>
      )
    }

    return <WrappedComponent {...props} />
  }

  ComponentWithVerifier.displayName = `withWalletStatusVerifier(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`

  return ComponentWithVerifier
}

export { WalletStatusVerifier, withWalletStatusVerifier }
