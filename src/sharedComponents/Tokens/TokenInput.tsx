import { useEffect, useState, type FC } from 'react'
import styled from 'styled-components'

import { Button, Text } from 'db-ui-toolkit'
import { formatUnits, getAddress } from 'viem'
import { useAccount } from 'wagmi'

import { useErc20Balance } from '@/src/hooks/useErc20Balance'
import { BigNumberInput, BigNumberInputProps } from '@/src/sharedComponents/BigNumberInput'
import TokenLogo from '@/src/sharedComponents/TokenLogo'
import { type Token } from '@/src/token'

const Wrapper = styled.div``

const Row = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
`

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
  const [amountError, setBalanceError] = useState<string | null>()
  const { address: userWallet } = useAccount()
  const { balance, balanceError, isLoadingBalance } = useErc20Balance({
    address: userWallet ? getAddress(userWallet) : undefined,
    token,
  })

  // reset the amount if token changes
  useEffect(() => {
    setAmount('')
  }, [token])

  const handleSetMax = () => {
    setAmount(formatUnits(balance ?? 0n, token.decimals))
  }

  const handleError: BigNumberInputProps['onError'] = (error) => {
    setBalanceError(error?.message)
  }

  return (
    <Wrapper>
      <Row>
        <BigNumberInput
          decimals={token.decimals}
          max={balance ? formatUnits(balance, token.decimals) : undefined}
          onChange={setAmount}
          onError={(error) => handleError(error)}
          value={amount}
        />
        <TokenLogo token={token} />
      </Row>

      {amountError && (
        <Row>
          <Error>{amountError}</Error>
        </Row>
      )}

      <Row>
        {balanceError ? (
          <Text>something went wrong...</Text>
        ) : (
          <Text>
            {isLoadingBalance ? '...' : `Balance: ${formatUnits(balance ?? 0n, token.decimals)}`}
          </Text>
        )}
        <Button disabled={isLoadingBalance || !!balanceError} onClick={handleSetMax}>
          Max
        </Button>
      </Row>
    </Wrapper>
  )
}

export default TokenInput
