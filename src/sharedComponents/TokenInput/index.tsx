import { useCallback, useEffect, useState, type FC } from 'react'
import styled from 'styled-components'

import { useDialog, Textfield, Spinner } from 'db-ui-toolkit'
import { formatUnits, getAddress } from 'viem'
import { useAccount } from 'wagmi'

import { useErc20Balance } from '@/src/hooks/useErc20Balance'
import { BigNumberInput, type BigNumberInputProps } from '@/src/sharedComponents/BigNumberInput'
import BaseCloseButton from '@/src/sharedComponents/TokenInput/CloseButton'
import {
  Balance,
  BalanceValue,
  BottomRow,
  Error,
  EstimatedUSDValue,
  Icon,
  MaxButton,
  SelectButton,
  Title,
  TopRow,
  Wrapper,
} from '@/src/sharedComponents/TokenInput/Components'
import TokenLogo from '@/src/sharedComponents/TokenLogo'
import BaseTokenSelect, {
  Loading,
  type Props as TokenSelectProps,
} from '@/src/sharedComponents/TokenSelect'
import { type Token } from '@/src/types/token'
const TokenSelect = styled(BaseTokenSelect)`
  position: relative;
`

export const CloseButton = styled(BaseCloseButton)`
  position: absolute;
  right: var(--base-token-select-horizontal-padding);
  top: calc(var(--base-common-padding) * 5);
`

interface Props extends Omit<TokenSelectProps, 'onError'> {
  onAmountSet: (amount?: string) => void
  onError: (error?: string) => void
  title?: string
}

/**
 * TokenInput component allows users to input token amounts and select tokens from a list.
 * It displays the token input field, token balance, and a dropdown list of available tokens.
 *
 * @param {(amount?: string) => void} onAmountSet - A callback function triggered when the amount is set.
 * @param {(error?: string) => void} onError - A callback function triggered when there is an error.
 * @param {string} title - The title of the token input.
 * @param {TokenSelectProps} props - The props for the TokenSelect component.
 *
 * Individual CSS classes are available for deep styling of individual components within TokenSelect:
 *
 * Also theme CSS vars are available for cosmetic changes:
 *
 * Main wrapper:
 * * --theme-token-input-background
 * * --base-token-input-border-radius
 * * --base-token-input-padding
 * * --base-token-input-gap
 *
 * Title
 * * --theme-token-input-title-color
 *
 * Textfield:
 * * --theme-token-input-textfield-background-color
 * * --theme-token-input-textfield-background-color-active
 * * --theme-token-input-textfield-border-color
 * * --theme-token-input-textfield-border-color-active
 * * --theme-token-input-textfield-color
 * * --theme-token-input-textfield-color-active
 * * --theme-token-input-textfield-placeholder-color
 * * --base-token-input-texfield-height
 * * --base-token-input-texfield-font-size
 *
 * Select button:
 * * --theme-token-input-select-button-background-color
 * * --theme-token-input-select-button-background-color-hover
 * * --theme-token-input-select-button-border-color
 * * --theme-token-input-select-button-border-color-hover
 * * --theme-token-input-select-button-border-color-active
 * * --theme-token-input-select-button-color
 * * --theme-token-input-select-button-color-hover
 * * --theme-token-input-select-button-background-color-disabled
 * * --theme-token-input-select-button-border-color-disabled
 * * --theme-token-input-select-button-color-disabled
 *
 * Max Button:
 * * --theme-token-input-max-button-background-color
 * * --theme-token-input-max-button-background-color-hover
 * * --theme-token-input-max-button-border-color
 * * --theme-token-input-max-button-border-color-hover
 * * --theme-token-input-max-button-border-color-active
 * * --theme-token-input-max-button-color
 * * --theme-token-input-max-button-color-hover
 * * --theme-token-input-max-button-background-color-disabled
 * * --theme-token-input-max-button-border-color-disabled
 * * --theme-token-input-max-button-color-disabled
 *
 * Estimated USD Value
 * * --theme-token-input-estimated-usd-color
 *
 * Balance
 * *--theme-token-input-balance-color
 *
 */
const TokenInput: FC<Props> = ({
  containerHeight,
  currentNetworkId,
  iconSize,
  itemHeight,
  networks,
  onAmountSet,
  onError,
  onTokenSelect,
  placeholder,
  showBalance,
  showTopTokens,
  title,
  ...restProps
}) => {
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
      close('token-select')
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

  const showTokenSelect = () => {
    open('token-select')
  }

  const selectIconSize = 24

  return (
    <>
      <Wrapper {...restProps}>
        {title && <Title>{title}</Title>}
        <TopRow>
          <BigNumberInput
            decimals={selectedToken ? selectedToken.decimals : 2}
            max={
              balance && selectedToken ? formatUnits(balance, selectedToken.decimals) : undefined
            }
            onChange={handleSetAmount}
            onError={(error) => handleError(error)}
            renderInput={() => (
              <Textfield $status={amountError ? 'error' : undefined} placeholder="0.00" />
            )}
            value={amount}
          />
          <SelectButton onClick={showTokenSelect}>
            {selectedToken ? (
              <>
                <Icon $iconSize={selectIconSize}>
                  <TokenLogo size={selectIconSize} token={selectedToken} />
                </Icon>
                {selectedToken.symbol}
              </>
            ) : (
              'Select'
            )}
          </SelectButton>
        </TopRow>
        <BottomRow>
          <EstimatedUSDValue>~$0.00</EstimatedUSDValue>
          <Balance>
            <BalanceValue>
              {balanceError && 'Error...'}
              {isLoadingBalance ? (
                <Spinner height={20} width={20} />
              ) : (
                `Balance: ${formatUnits(balance ?? 0n, selectedToken?.decimals ?? 0)}`
              )}
            </BalanceValue>
            <MaxButton disabled={isLoadingBalance || !!balanceError} onClick={handleSetMax}>
              Max
            </MaxButton>
          </Balance>
        </BottomRow>
        {amountError && <Error>{amountError}</Error>}
      </Wrapper>
      <Dialog id="token-select">
        <TokenSelect
          containerHeight={containerHeight}
          currentNetworkId={currentNetworkId}
          iconSize={iconSize}
          itemHeight={itemHeight}
          networks={networks}
          onTokenSelect={handleSelectedToken}
          placeholder={placeholder}
          showBalance={showBalance}
          showTopTokens={showTopTokens}
          suspenseFallback={<Loading />}
        >
          <CloseButton onClick={() => close('token-select')} />
        </TokenSelect>
      </Dialog>
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
