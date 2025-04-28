import PrimaryButton from '@/src/components/sharedComponents/ui/PrimaryButton'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { type ButtonProps, Flex, Menu, Portal } from '@chakra-ui/react'
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

const ChevronDown = () => (
  <svg
    className="chevronDown"
    fill="none"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Chevron down</title>
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

const Button: FC<ButtonProps> = ({ children, ...restProps }) => {
  return (
    <PrimaryButton
      fontSize="16px"
      fontWeight="500"
      height="48px"
      paddingLeft={6}
      paddingRight={6}
      css={{
        '& .chevronDown': {
          transition: 'transform var(--base-transition-duration-xs) ease-in-out',
        },
        '&[aria-expanded="true"] .chevronDown': {
          transform: 'rotate(180deg)',
        },
      }}
      type="button"
      {...restProps}
    >
      {children} <ChevronDown />
    </PrimaryButton>
  )
}

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
        <Button disabled={!isWalletConnected}>
          {networkItem ? (
            <>
              <Flex
                alignItems="center"
                backgroundColor="var(--theme-switch-network-icon-background-color)"
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
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content
            padding="0"
            backgroundColor="var(--theme-dropdown-background-color)"
            borderColor="var(--theme-dropdown-border-color)"
            boxShadow="var(--theme-dropdown-box-shadow)"
            width="250px"
          >
            {networks.map(({ icon, id, label }) => (
              <Menu.Item
                alignItems="center"
                backgroundColor="var(--theme-dropdown-item-background-color)"
                borderBottom="1px solid var(--theme-dropdown-item-border-color)"
                color="var(--theme-dropdown-item-color)"
                columnGap={2}
                cursor="pointer"
                display="flex"
                fontSize="16px"
                fontWeight="400"
                justifyContent="flex-start"
                key={`${id}-${label}`}
                lineHeight="1.4"
                minHeight="48px"
                onClick={() => handleClick(id)}
                overflow="hidden"
                paddingX={4}
                transition="background-color var(--base-transition-duration-xs) ease-in-out"
                value={label}
                width="250px"
                _hover={{
                  backgroundColor: 'var(--theme-dropdown-item-background-color-hover)',
                  color: 'var(--theme-dropdown-item-color-hover)',
                  borderBottom: '1px solid var( --theme-dropdown-item-border-color-hover)',
                }}
                _active={{
                  backgroundColor: 'var(--theme-dropdown-item-background-color-active)',
                  color: 'var(--theme-dropdown-item-color-active)',
                  borderBottom: '1px solid var( --theme-dropdown-item-border-color-active)',
                }}
              >
                {icon}
                {label}
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}

export default SwitchNetwork
