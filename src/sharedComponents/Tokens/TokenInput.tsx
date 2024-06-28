import { useState, type FC } from 'react'
import styled from 'styled-components'

import { Button, Text } from 'db-ui-toolkit'
import { erc20Abi, formatUnits, getAddress } from 'viem'
import * as chains from 'viem/chains'
import { useAccount, useReadContract } from 'wagmi'

import { BigNumberInput, BigNumberInputProps } from '@/src/sharedComponents/BigNumberInput'
import { type Token } from '@/src/token'

const Error = styled.p`
  background-color: #6c0000;
  color: #ff0;
  font-weight: 800;
  padding: 0.25em;
`

type TokenInputProps = {
  token: Token
}

const TokenInput: FC<TokenInputProps> = ({ token }) => {
  const [amount, setAmount] = useState('')
  const [balanceError, setBalanceError] = useState<string | null>()
  const { address: userWallet } = useAccount()
  const { data, error, isLoading } = useReadContract({
    abi: erc20Abi,
    address: getAddress(token.address),
    args: [getAddress(userWallet!)],
    chainId: token.chainId,
    functionName: 'balanceOf',
  })

  const handleSetMax = () => {
    setAmount(formatUnits(data!, token.decimals))
  }

  const handleError: BigNumberInputProps['onError'] = (error) => {
    setBalanceError(error?.message)
  }

  return (
    <>
      <Text>
        Selected token:{' '}
        <strong>
          {token.symbol} ({Object.values(chains).find(({ id }) => id === token.chainId)?.name})
        </strong>
      </Text>
      {error ? (
        <Text>something went wrong...</Text>
      ) : (
        <Text>{isLoading ? '...' : `User balance: ${formatUnits(data!, token.decimals)}`}</Text>
      )}
      <Button disabled={isLoading || !!error} onClick={handleSetMax}>
        Max
      </Button>
      <BigNumberInput
        decimals={token.decimals}
        max={data ? formatUnits(data, token.decimals) : '0'}
        onChange={setAmount}
        onError={(error) => handleError(error)}
        value={amount}
      />
      {balanceError && <Error>{balanceError}</Error>}
    </>
  )
}

export default TokenInput
