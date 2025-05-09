import PrimaryButton from '@/src/components/sharedComponents/ui/PrimaryButton'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { type ChainsIds, chains } from '@/src/lib/networks.config'
import { ConnectWalletButton } from '@/src/providers/Web3Provider'
import { chakra } from '@chakra-ui/react'
import type { ComponentType, FC, ReactElement } from 'react'
import { extractChain } from 'viem'

const Button = chakra(PrimaryButton, {
  base: {
    fontSize: '16px',
    fontWeight: 500,
    height: '48px',
    paddingLeft: 6,
    paddingRight: 6,
  },
})

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
}: WalletStatusVerifierProps) => {
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
 * WalletStatusVerifier Component
 *
 * Checks the wallet connection and chain synchronization status.
 * - If wallet is not connected, displays fallback component (default: ConnectWalletButton)
 * - If wallet is connected but on wrong chain, provides option to switch networks
 * - If wallet is connected and on correct chain, renders children
 *
 * @param {WalletStatusVerifierProps} props - Component props
 * @param {ChainsIds} [props.chainId] - The required chain ID (defaults to appChainId)
 * @param {ReactElement} [props.children] - The content to render when wallet is connected and synced
 * @param {ReactElement} [props.fallback=<ConnectWalletButton />] - Component to render when wallet is not connected
 * @param {string} [props.labelSwitchChain='Switch to'] - Label for the chain switching button
 *
 * @example
 * ```tsx
 * <WalletStatusVerifier chainId={1}>
 *   <MyProtectedComponent />
 * </WalletStatusVerifier>
 * ```
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

export { WalletStatusVerifier, withWalletStatusVerifier }
