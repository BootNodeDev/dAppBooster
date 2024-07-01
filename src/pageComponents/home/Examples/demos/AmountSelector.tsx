import { polygon } from 'viem/chains'

import TokenInput from '@/src/sharedComponents/TokenSelect/TokenInput'

const AmountSelector = () => {
  return (
    <TokenInput
      chain={polygon}
      onAmountSet={console.log.bind(console, 'amount')}
      onError={console.log.bind(console, 'error')}
      onTokenSelected={console.log.bind(console, 'token')}
    />
  )
}

export default AmountSelector
