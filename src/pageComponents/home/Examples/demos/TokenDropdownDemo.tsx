import { type FC, useState } from 'react'

import { arbitrum, mainnet, optimism, polygon } from 'viem/chains'

import Arbitrum from '@/src/pageComponents/home/Examples/demos/assets/Arbitrum'
import Eth from '@/src/pageComponents/home/Examples/demos/assets/Eth'
import Optimism from '@/src/pageComponents/home/Examples/demos/assets/Optimism'
import Polygon from '@/src/pageComponents/home/Examples/demos/assets/Polygon'
import TokenDropdown, { type TokenDropdownProps } from '@/src/sharedComponents/TokenDropdown'
import { type Networks } from '@/src/sharedComponents/TokenSelect'
import { type Token } from '@/src/types/token'

const TokenDropdownDemo: FC<Partial<TokenDropdownProps>> = ({ ...restProps }) => {
  const [currentNetworkId, setCurrentNetworkId] = useState<number>(mainnet.id)
  const [currentToken, setCurrentToken] = useState<Token>()
  const networks: Networks = [
    {
      icon: <Eth />,
      id: mainnet.id,
      label: mainnet.name,
      onClick: () => setCurrentNetworkId(mainnet.id),
    },
    {
      icon: <Optimism />,
      id: optimism.id,
      label: optimism.name,
      onClick: () => setCurrentNetworkId(optimism.id),
    },
    {
      icon: <Arbitrum />,
      id: arbitrum.id,
      label: arbitrum.name,
      onClick: () => setCurrentNetworkId(arbitrum.id),
    },
    {
      icon: <Polygon />,
      id: polygon.id,
      label: polygon.name,
      onClick: () => setCurrentNetworkId(polygon.id),
    },
  ]

  const onTokenSelect = (token: Token | undefined) => {
    setCurrentToken(token)
  }

  return (
    <TokenDropdown
      currentNetworkId={currentNetworkId}
      currentToken={currentToken}
      networks={networks}
      onTokenSelect={onTokenSelect}
      showTopTokens
      {...restProps}
    />
  )
}

export default TokenDropdownDemo
