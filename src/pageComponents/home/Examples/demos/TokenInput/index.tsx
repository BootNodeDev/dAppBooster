import { useEffect, useState } from 'react'

import { mainnet } from 'viem/chains'

import TokenInput from '@/src/sharedComponents/TokenInput'
import { type Token } from '@/src/types/token'

const TokenInputDemo = () => {
  const [currentToken, setCurrentToken] = useState<Token | undefined>()
  const [amount, setAmount] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()

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
      currentNetworkId={mainnet.id}
      onAmountSet={onAmountSet}
      onError={onError}
      onTokenSelect={onTokenSelect}
    />
  )
}

export default TokenInputDemo
