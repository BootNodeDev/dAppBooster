import { useState, type FC } from 'react'
import styled from 'styled-components'

import { Button, Text } from 'db-ui-toolkit'
import { formatUnits, getAddress } from 'viem'
import * as chains from 'viem/chains'
import { useAccount } from 'wagmi'

import { useErc20Balance } from '@/src/hooks/useErc20Balance'
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
  const { balance, isLoadingBalance, loadingBalanceError } = useErc20Balance({
    address: getAddress(userWallet!),
    token,
  })

  const handleSetMax = () => {
    setAmount(formatUnits(balance!, token.decimals))
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
      {loadingBalanceError ? (
        <Text>something went wrong...</Text>
      ) : (
        <Text>
          {isLoadingBalance ? '...' : `User balance: ${formatUnits(balance!, token.decimals)}`}
        </Text>
      )}
      <Button disabled={isLoadingBalance || !!loadingBalanceError} onClick={handleSetMax}>
        Max
      </Button>
      <BigNumberInput
        decimals={token.decimals}
        max={balance ? formatUnits(balance, token.decimals) : '0'}
        onChange={setAmount}
        onError={(error) => handleError(error)}
        value={amount}
      />
      {balanceError && <Error>{balanceError}</Error>}
    </>
  )
}

export default TokenInput
