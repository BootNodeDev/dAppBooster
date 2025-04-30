import DropdownButton from '@/src/components/sharedComponents/ui/DropdownButton'
import { MenuContent, MenuItem } from '@/src/components/sharedComponents/ui/Menu'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { Flex, Menu, Portal } from '@chakra-ui/react'
import {
  type ComponentPropsWithoutRef,
  type FC,
  type ReactElement,
  useEffect,
  useState,
} from 'react'
import * as chains from 'viem/chains'
import { useSwitchChain } from 'wagmi'

type NetworkItem = {
  icon: ReactElement
  id: number
  label: string
}

export type Networks = Array<NetworkItem>

interface SwitchNetworkProps extends ComponentPropsWithoutRef<'div'> {
  networks: Networks
}

/**
 * SwitchNetwork component.
 *
 * @param {SwitchNetworkProps} props - SwitchNetwork component props.
 * @param {Networks} props.networks - List of networks to display in the dropdown.
 */
const SwitchNetwork: FC<SwitchNetworkProps> = ({ networks }) => {
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
    <Menu.Root positioning={{ placement: 'bottom-end' }}>
      <Menu.Trigger asChild>
        <DropdownButton disabled={!isWalletConnected}>
          {networkItem ? (
            <>
              <Flex
                alignItems="center"
                borderRadius="50%"
                display="flex"
                height="24px"
                justifyContent="center"
                overflow="hidden"
                width="24px"
              >
                {networkItem?.icon}
              </Flex>{' '}
              {networkItem?.label}
            </>
          ) : (
            'Select a network'
          )}
        </DropdownButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <MenuContent width="250px">
            {networks.map(({ icon, id, label }) => (
              <MenuItem
                key={`${id}-${label}`}
                onClick={() => handleClick(id)}
                value={label}
              >
                {icon}
                {label}
              </MenuItem>
            ))}
          </MenuContent>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}

export default SwitchNetwork
