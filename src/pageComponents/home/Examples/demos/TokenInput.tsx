import { useEffect, useState } from 'react'

import { arbitrum, mainnet, polygon } from 'viem/chains'

import Arbitrum from '@/src/pageComponents/home/Examples/demos/assets/Arbitrum'
import Eth from '@/src/pageComponents/home/Examples/demos/assets/Eth'
import Polygon from '@/src/pageComponents/home/Examples/demos/assets/Polygon'
import TokenInput from '@/src/sharedComponents/TokenInput'
import { type Networks } from '@/src/sharedComponents/TokenSelect'
import { type Token } from '@/src/types/token'

const TokenInputDemo = () => {
  const [currentNetworkId, setCurrentNetworkId] = useState<number>(mainnet.id)
  const [currentToken, setCurrentToken] = useState<Token | undefined>()
  const [amount, setAmount] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()

  const networks: Networks = [
    {
      icon: <Eth />,
      id: mainnet.id,
      label: mainnet.name,
      onClick: () => setCurrentNetworkId(mainnet.id),
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

  const onAmountSet = (amount?: string) => {
    setAmount(amount)
  }

  const onError = (error?: string) => {
    setError(error)
  }

  useEffect(() => {
    console.log(currentToken)
    console.log(amount)
    console.log(error)
  }, [currentToken, amount, error])

  return (
    <TokenInput
      currentNetworkId={currentNetworkId}
      networks={networks}
      onAmountSet={onAmountSet}
      onError={onError}
      onTokenSelect={onTokenSelect}
      title="You pay"
    />
  )
}

export default TokenInputDemo
