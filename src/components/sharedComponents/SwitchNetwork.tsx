import {
  type ComponentPropsWithoutRef,
  type FC,
  type ReactElement,
  useState,
  useEffect,
} from 'react'
import styled from 'styled-components'

import { Dropdown, Item as BaseItem } from '@bootnodedev/db-ui-toolkit'
import * as chains from 'viem/chains'
import { useSwitchChain } from 'wagmi'

import { PrimaryButton } from '@/src/components/sharedComponents/ui/Buttons'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'

type NetworkItem = {
  icon: ReactElement
  id: number
  label: string
}

export type Networks = Array<NetworkItem>

const ChevronDown = () => (
  <svg
    className="chevronDown"
    fill="none"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

const Button = styled(PrimaryButton).attrs(({ children, className = 'switchNetworkButton' }) => {
  return {
    children: (
      <>
        {children} <ChevronDown />
      </>
    ),
    type: 'button',
    className,
  }
})`
  font-size: 1.6rem;
  font-weight: 500;
  height: 48px;
  padding-left: calc(var(--base-common-padding, 8px) * 3);
  padding-right: calc(var(--base-common-padding, 8px) * 3);

  .chevronDown {
    transition: transform var(--base-transition-duration-xs, 0.1s) ease-in-out;
  }

  .isActive & {
    .chevronDown {
      transform: rotate(180deg);
    }
  }
`

const NetworkIcon = styled.div.attrs(() => {
  return { className: 'switchNetworkNetworkIcon' }
})`
  align-items: center;
  background-color: var(--theme-switch-network-icon-background-color, #fff);
  border-radius: 50%;
  display: flex;
  height: 24px;
  justify-content: center;
  overflow: hidden;
  width: 24px;
`

const ListItem = styled(BaseItem).attrs(() => {
  return { className: 'switchNetworkListItem' }
})`
  font-size: 1.6rem;
  min-height: 48px;
  width: 250px;
`

interface SwitchNetworkProps extends ComponentPropsWithoutRef<'div'> {
  networks: Networks
}

/**
 * SwitchNetwork component.
 *
 * @param {SwitchNetworkProps} props - SwitchNetwork component props.
 * @param {Networks} props.networks - List of networks to display in the dropdown.
 */
const SwitchNetwork: FC<SwitchNetworkProps> = ({ networks, ...restProps }) => {
  const findChain = (chainId: number) => Object.values(chains).find((chain) => chain.id === chainId)

  const { chains: configuredChains, switchChain } = useSwitchChain()
  const { isWalletConnected, walletChainId, walletClient } = useWeb3Status()
  const [networkItem, setNetworkItem] = useState<NetworkItem>()

  const handleClick = (chainId: number) => {
    /**
     * First, attempt to switch to the chain if it's already configured
     */
    if (configuredChains.some((chain) => chain.id === chainId)) {
      switchChain({ chainId })
    } else {
      /**
       * If the chain isn't configured, allow to switch to it based on the chain id
       */
      const selectedChain = findChain(chainId)
      if (selectedChain) {
        walletClient?.addChain({ chain: selectedChain })
      }
    }
  }

  useEffect(() => {
    setNetworkItem(networks.find((networkItem) => networkItem.id === walletChainId))
  }, [walletChainId, networks])

  return (
    <Dropdown
      button={
        <Button>
          {networkItem ? (
            <>
              <NetworkIcon>{networkItem?.icon}</NetworkIcon> {networkItem?.label}
            </>
          ) : (
            'Select a network'
          )}
        </Button>
      }
      disabled={!isWalletConnected}
      items={networks.map(({ icon, id, label }, index) => (
        <ListItem key={index} onClick={() => handleClick(id)}>
          {icon}
          {label}
        </ListItem>
      ))}
      position="right"
      {...restProps}
    />
  )
}

export default SwitchNetwork
