import { useCallback, useEffect, useState, type FC } from 'react'
import styled from 'styled-components'

import { useDialog, Textfield, Spinner } from 'db-ui-toolkit'
import { formatUnits, getAddress } from 'viem'
import { useAccount } from 'wagmi'

import { useErc20Balance } from '@/src/hooks/useErc20Balance'
import { BigNumberInput, type BigNumberInputProps } from '@/src/sharedComponents/BigNumberInput'
import { PrimaryButton } from '@/src/sharedComponents/Buttons'
import BaseCloseButton from '@/src/sharedComponents/TokenInput/CloseButton'
import TokenLogo from '@/src/sharedComponents/TokenLogo'
import BaseTokenSelect, { Loading } from '@/src/sharedComponents/TokenSelect'
import { type Token } from '@/src/types/token'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: var(--base-gap-xl);
`

const TokenSelect = styled(BaseTokenSelect)`
  position: relative;
`

const CloseButton = styled(BaseCloseButton)`
  position: absolute;
  right: var(--base-token-select-horizontal-padding);
  top: calc(var(--base-common-padding) * 5);
`

const Row = styled.div`
  column-gap: var(--base-gap);
  display: flex;
`

const Input = styled(Textfield)`
  min-width: 260px;
`

const TokenButton = styled(PrimaryButton)`
  height: auto;
`

const Error = styled.span`
  color: var(--theme-color-danger);
  font-weight: 700;
  font-size: 1.2rem;
  padding: 0;
`

const Balance = styled.div`
  align-items: center;
  column-gap: var(--base-gap);
  display: flex;
  justify-content: flex-end;
`

const Value = styled.span`
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.2;
`

const MaxButton = styled(PrimaryButton)`
  font-size: 1.2rem;
  font-weight: 400;
  height: 22px;
  padding: var(--base-common-padding);
`

const Icon = styled.div<{ $iconSize?: number }>`
  align-items: center;
  border-radius: 50%;
  display: flex;
  height: ${({ $iconSize }) => $iconSize}px;
  justify-content: center;
  overflow: hidden;
  width: ${({ $iconSize }) => $iconSize}px;
`

interface Props {
  currentNetworkId: number
  onAmountSet: (amount?: string) => void
  onError: (error?: string) => void
  onTokenSelect: (token: Token | undefined) => void
}

/**
 * TokenInput component allows users to input token amounts and select tokens from a list.
 * It displays the token input field, token balance, and a dropdown list of available tokens.
 *
 * @param onAmountSet - A callback function triggered when the amount is set.
 * @param onError - A callback function triggered when there is an error.
 */
const TokenInput: FC<Props> = ({ currentNetworkId, onAmountSet, onError, onTokenSelect }) => {
  const {
    amount,
    amountError,
    balance,
    balanceError,
    isLoadingBalance,
    selectedToken,
    setAmount,
    setAmountError,
    setTokenSelected,
  } = useTokenInput()
  const { Dialog, close, open } = useDialog()

  const handleSelectedToken = useCallback(
    (token: Token | undefined) => {
      onTokenSelect(token)
      setTokenSelected(token)
      close()
    },
    [close, onTokenSelect, setTokenSelected],
  )

  const handleSetAmount = (amount: string) => {
    setAmount(amount)
    onAmountSet(amount)
  }

  const handleSetMax = () => {
    handleSetAmount(formatUnits(balance ?? 0n, selectedToken!.decimals))
  }

  const handleError: BigNumberInputProps['onError'] = (error) => {
    onError(error?.message)
    setAmountError(error?.message)
  }

  const showTokenSelect = useCallback(() => {
    open(
      <TokenSelect
        currentNetworkId={currentNetworkId}
        onTokenSelect={handleSelectedToken}
        suspenseFallback={<Loading />}
      >
        <CloseButton onClick={close} />
      </TokenSelect>,
    )
  }, [close, currentNetworkId, handleSelectedToken, open])

  return (
    <>
      <Wrapper>
        <Row>
          <BigNumberInput
            decimals={selectedToken ? selectedToken.decimals : 2}
            max={
              balance && selectedToken ? formatUnits(balance, selectedToken.decimals) : undefined
            }
            onChange={handleSetAmount}
            onError={(error) => handleError(error)}
            renderInput={() => <Input placeholder="0.00" />}
            value={amount}
          />
          <TokenButton onClick={showTokenSelect}>
            {selectedToken ? (
              <>
                <Icon $iconSize={24}>
                  <TokenLogo size={24} token={selectedToken} />
                </Icon>
                {selectedToken.symbol}
              </>
            ) : (
              'Select'
            )}
          </TokenButton>
        </Row>
        <Balance>
          <Value>
            {balanceError ? (
              'Error...'
            ) : isLoadingBalance ? (
              <Spinner height={20} width={20} />
            ) : (
              `Balance: ${formatUnits(balance ?? 0n, selectedToken?.decimals ?? 0)}`
            )}
          </Value>
          <MaxButton disabled={isLoadingBalance || !!balanceError} onClick={handleSetMax}>
            Max
          </MaxButton>
        </Balance>
        {amountError && <Error>{amountError}</Error>}
      </Wrapper>
      <Dialog />
    </>
  )
}

function useTokenInput() {
  const [amount, setAmount] = useState('')
  const [amountError, setAmountError] = useState<string | null>()
  const [selectedToken, setTokenSelected] = useState<Token>()

  const { address: userWallet } = useAccount()
  const { balance, balanceError, isLoadingBalance } = useErc20Balance({
    address: userWallet ? getAddress(userWallet) : undefined,
    token: selectedToken,
  })

  // reset amount when token change
  useEffect(() => {
    setAmount('')
  }, [selectedToken])

  return {
    amount,
    setAmount,
    amountError,
    setAmountError,
    balance,
    balanceError,
    isLoadingBalance,
    selectedToken,
    setTokenSelected,
  }
}

export default TokenInput
