import { FC } from 'react'
import styled from 'styled-components'

import { Button as BaseButton } from 'db-ui-toolkit'
import * as chains from 'viem/chains'
import { useSwitchChain } from 'wagmi'

import { useWeb3Status } from '@/src/hooks/useWeb3Status'

const Button = styled(BaseButton)`
  border: none;
  border-radius: 50%;
  height: 32px;
  width: 32px;

  /** it works on my machine */
  padding-bottom: 0.1em;

  &:hover {
    background-color: var(--theme-copy-button-color-hover);
    color: var(--theme-button-secondary-color-hover);
  }
`

/**
 * @name SwitchNetworkButton
 * @description Button component for adding or switching a network.
 *
 * @component
 * @param {object} props - The component props.
 * @param {string} props.chainId - The ID of the chain.
 * @returns {JSX.Element} The rendered component.
 */
const SwitchNetworkButton: FC<{ chainId: chains.Chain['id'] }> = ({ chainId }) => {
  const { chains: configuredChains, switchChain } = useSwitchChain()
  const { isWalletConnected, walletClient } = useWeb3Status()

  const handleClick = () => {
    // first, attempt to switch to the chain if it's already configured
    if (configuredChains.some((chain) => chain.id === chainId)) {
      switchChain({ chainId })
    } else {
      // if the chain isn't configured, allow to switch to it based on the chain id
      const selectedChain = Object.values(chains).find((chain) => chain.id === chainId)
      selectedChain && walletClient?.addChain({ chain: selectedChain })
    }
  }

  return (
    <Button disabled={!isWalletConnected} onClick={handleClick}>
      &harr;
    </Button>
  )
}

export default SwitchNetworkButton
