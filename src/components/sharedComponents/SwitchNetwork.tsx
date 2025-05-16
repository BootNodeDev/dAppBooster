import DropdownButton from '@/src/components/sharedComponents/ui/DropdownButton'
import { MenuContent, MenuItem } from '@/src/components/sharedComponents/ui/Menu'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { Box, Flex, Menu } from '@chakra-ui/react'
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
 * SwitchNetwork component for selecting and switching blockchain networks.
 *
 * This component renders a dropdown menu that allows users to select from a list of
 * blockchain networks and switch the connected wallet to the selected network.
 *
 * @param {SwitchNetworkProps} props - SwitchNetwork component props.
 * @param {Networks} props.networks - List of networks to display in the dropdown.
 * @param {ReactElement} props.networks[].icon - Icon representing the network.
 * @param {number} props.networks[].id - Chain ID of the network.
 * @param {string} props.networks[].label - Display name of the network.
 * @param {ComponentPropsWithoutRef<'div'>} [props.restProps] - Additional props inherited from div element.
 *
 * @example
 * ```tsx
 * <SwitchNetwork
 *   networks={[
 *     { id: 1, label: "Ethereum", icon: <EthereumIcon /> },
 *     { id: 10, label: "Optimism", icon: <OptimismIcon /> }
 *   ]}
 * />
 * ```
 */
const SwitchNetwork: FC<SwitchNetworkProps> = ({ networks }: SwitchNetworkProps) => {
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
    <Menu.Root positioning={{ placement: 'bottom' }}>
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
                <Box
                  rounded="full"
                  overflow="hidden"
                >
                  {networkItem?.icon}
                </Box>
              </Flex>{' '}
              {networkItem?.label}
            </>
          ) : (
            'Select a network'
          )}
        </DropdownButton>
      </Menu.Trigger>
      <Menu.Positioner>
        <MenuContent width="250px">
          {networks.map(({ icon, id, label }) => (
            <MenuItem
              key={`${id}-${label}`}
              onClick={() => handleClick(id)}
              value={label}
            >
              <Box
                rounded="full"
                overflow="hidden"
              >
                {icon}
              </Box>
              {label}
            </MenuItem>
          ))}
        </MenuContent>
      </Menu.Positioner>
    </Menu.Root>
  )
}

export default SwitchNetwork
