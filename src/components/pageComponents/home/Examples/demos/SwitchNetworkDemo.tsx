import { arbitrum, mainnet, optimism, polygon } from 'viem/chains'

import Arbitrum from '@/src/components/pageComponents/home/Examples/demos/assets/Arbitrum'
import Eth from '@/src/components/pageComponents/home/Examples/demos/assets/Eth'
import Optimism from '@/src/components/pageComponents/home/Examples/demos/assets/Optimism'
import Polygon from '@/src/components/pageComponents/home/Examples/demos/assets/Polygon'
import SwitchNetwork, { type Networks } from '@/src/components/sharedComponents/SwitchNetwork'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { ConnectWalletButton } from '@/src/providers/Web3Provider'

const SwitchNetworkDemo = () => {
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
    <SwitchNetwork networks={networks} />
  ) : (
    <ConnectWalletButton label="Connect to switch network" />
  )
}

export default SwitchNetworkDemo
