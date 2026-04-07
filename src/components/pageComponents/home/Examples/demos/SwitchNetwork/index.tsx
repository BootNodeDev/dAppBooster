import {
  NetworkArbitrumOne,
  NetworkEthereum,
  NetworkOptimism,
  NetworkPolygon,
} from '@web3icons/react'
import { arbitrum, mainnet, optimism, polygon } from 'viem/chains'
import Icon from '@/src/components/pageComponents/home/Examples/demos/SwitchNetwork/Icon'
import { useWallet } from '@/src/sdk/react/hooks'
import { SwitchNetwork as BaseSwitchNetwork } from '@/src/wallet/components'
import { ConnectWalletButton } from '@/src/wallet/providers'
import type { Networks } from '@/src/wallet/types'

const SwitchNetwork = () => {
  const {
    status: { connected: isWalletConnected },
  } = useWallet()
  const networks: Networks = [
    {
      icon: (
        <NetworkEthereum
          size={24}
          variant="background"
        />
      ),
      id: mainnet.id,
      label: mainnet.name,
    },
    {
      icon: (
        <NetworkOptimism
          size={24}
          variant="background"
        />
      ),
      id: optimism.id,
      label: optimism.name,
    },
    {
      icon: (
        <NetworkArbitrumOne
          size={24}
          variant="background"
        />
      ),
      id: arbitrum.id,
      label: arbitrum.name,
    },
    {
      icon: (
        <NetworkPolygon
          size={24}
          variant="background"
        />
      ),
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
