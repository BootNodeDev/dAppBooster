import { arbitrum, mainnet, polygon, optimism } from 'viem/chains'

import Arbitrum from '@/src/components/pageComponents/home/Examples/demos/assets/Arbitrum'
import Eth from '@/src/components/pageComponents/home/Examples/demos/assets/Eth'
import Optimism from '@/src/components/pageComponents/home/Examples/demos/assets/Optimism'
import Polygon from '@/src/components/pageComponents/home/Examples/demos/assets/Polygon'
import SwitchNetwork, { type Networks } from '@/src/components/sharedComponents/SwitchNetwork'

const SwitchNetworkDemo = () => {
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

  return <SwitchNetwork networks={networks} />
}

export default SwitchNetworkDemo
