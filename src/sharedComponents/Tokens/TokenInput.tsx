import { useState, type FC } from 'react'

import { Text } from 'db-ui-toolkit'
import * as chains from 'viem/chains'

import { BigNumberInput } from '@/src/sharedComponents/BigNumberInput'
import { type Token } from '@/src/token'

const TokenInput: FC<{ token?: Token }> = ({ token }) => {
  const [amount, setAmount] = useState('')

  return token ? (
    <>
      <Text>
        Selected token:{' '}
        <strong>
          {token.symbol} ({Object.values(chains).find(({ id }) => id === token.chainId)?.name})
        </strong>
      </Text>
      <BigNumberInput decimals={token.decimals} onChange={setAmount} value={amount} />
    </>
  ) : (
    <input disabled placeholder="nothing to see here..." />
  )
}

export default TokenInput
