import { type ComponentType, type FC, type ReactElement } from 'react'
import styled from 'styled-components'

import { extractChain } from 'viem'

import { PrimaryButton } from '@/src/components/sharedComponents/Buttons'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { chains, type ChainsIds } from '@/src/lib/networks.config'
import { ConnectWalletButton } from '@/src/providers/Web3Provider'

const Button = styled(PrimaryButton)`
  font-size: 1.6rem;
  font-weight: 500;
  height: 48px;
  padding-left: calc(var(--base-common-padding) * 3);
  padding-right: calc(var(--base-common-padding) * 3);
`

interface WalletStatusVerifierProps {
  chainId?: ChainsIds
  children?: ReactElement
  fallback?: ReactElement
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

    return !isWalletConnected ? (
      fallback
    ) : !isWalletSynced || walletChainId !== chainToSwitch.id ? (
      <Button onClick={() => switchChain(chainToSwitch.id)}>
        {labelSwitchChain} {chainToSwitch?.name}
      </Button>
    ) : (
      <WrappedComponent {...props} />
    )
  }

  ComponentWithVerifier.displayName = `withWalletStatusVerifier(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`

  return ComponentWithVerifier
}

// eslint-disable-next-line react-refresh/only-export-components
export { WalletStatusVerifier, withWalletStatusVerifier }
