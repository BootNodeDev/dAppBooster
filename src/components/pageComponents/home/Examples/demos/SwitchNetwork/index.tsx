import Icon from '@/src/components/pageComponents/home/Examples/demos/SwitchNetwork/Icon'
import Arbitrum from '@/src/components/pageComponents/home/Examples/demos/assets/Arbitrum'
import Eth from '@/src/components/pageComponents/home/Examples/demos/assets/Eth'
import Optimism from '@/src/components/pageComponents/home/Examples/demos/assets/Optimism'
import Polygon from '@/src/components/pageComponents/home/Examples/demos/assets/Polygon'
import BaseSwitchNetwork, { type Networks } from '@/src/components/sharedComponents/SwitchNetwork'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { ConnectWalletButton } from '@/src/providers/Web3Provider'
import { arbitrum, mainnet, optimism, polygon } from 'viem/chains'

const SwitchNetwork = () => {
  const { isWalletConnected } = useWeb3Status()
  const networks: Networks = [
    {
      icon: <Eth />,
      id: mainnet.id,
      label: mainnet.name,
    },
    {
      icon: <Optimism />,
      id: optimism.id,
      label: optimism.name,
    },
    {
      icon: <Arbitrum />,
      id: arbitrum.id,
      label: arbitrum.name,
    },
    {
      icon: <Polygon />,
      id: polygon.id,
      label: polygon.name,
    },
  ]

  return isWalletConnected ? (
    <BaseSwitchNetwork networks={networks} />
  ) : (
    <ConnectWalletButton label="Connect to switch network" />
  )
}

const switchNetwork = {
  demo: <SwitchNetwork />,
  href: 'https://bootnodedev.github.io/dAppBooster/variables/components_sharedComponents_SwitchNetwork.SwitchNetwork.html',
  icon: <Icon />,
  text: 'Learn how to add or switch networks in supported wallets.',
  title: 'Add / switch network',
}

export default switchNetwork
