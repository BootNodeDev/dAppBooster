import { useMemo, useState, type FC } from 'react'
import styled from 'styled-components'

import { useDialog, Spinner } from 'db-ui-toolkit'
import { type NumberFormatValues, NumericFormat } from 'react-number-format'
import { formatUnits, getAddress } from 'viem'
import { useAccount, useBalance } from 'wagmi'

import {
  type BigNumberInputProps,
  BigNumberInput,
  type RenderInputProps,
} from '@/src/components/sharedComponents/BigNumberInput'
import BaseCloseButton from '@/src/components/sharedComponents/TokenInput/CloseButton'
import {
  Balance,
  BalanceValue,
  BottomRow,
  DropdownButton,
  Error,
  EstimatedUSDValue,
  Icon,
  MaxButton,
  Textfield,
  Title,
  TopRow,
  Wrapper,
} from '@/src/components/sharedComponents/TokenInput/Components'
import TokenLogo from '@/src/components/sharedComponents/TokenLogo'
import BaseTokenSelect, {
  Loading,
  type TokenSelectProps,
} from '@/src/components/sharedComponents/TokenSelect'
import { useErc20Balance } from '@/src/hooks/useErc20Balance'
import { type Token } from '@/src/types/token'
import { isNativeToken } from '@/src/utils/address'

const TokenSelect = styled(BaseTokenSelect)`
  position: relative;
`

/** @ignore */
export const CloseButton = styled(BaseCloseButton)`
  position: absolute;
  right: var(--base-token-select-horizontal-padding);
  top: calc(var(--base-common-padding) * 5);
`

interface TokenInputProps extends Omit<TokenSelectProps, 'onError' | 'onTokenSelect'> {
  singleToken?: boolean
  token?: Token
  onAmountSet: (amount?: string) => void
  onTokenSelect?: (token: Token | undefined) => void
  onError?: (error?: string) => void
  thousandSeparator?: boolean
  title?: string
}

/**
 * TokenInput component allows users to input token amounts and select tokens from a list.
 * It displays the token input field, token balance, and a dropdown list of available tokens.
 *
 * @param {TokenInputProps} props - TokenInput component props.
 * @param {(amount?: string) => void} props.onAmountSet - A callback function triggered when the amount is set.
 * @param {(error?: string) => void} props.onError - A callback function triggered when there is an error.
 * @param {boolean} [props.thousandSeparator=true] - Optional flag to enable thousands separator. Default is true.
 * @param {string} props.title - The title of the token input.
 * @param {number} [props.currentNetworkId=mainnet.id] - The current network id. Default is mainnet's id.
 * @param {function} props.onTokenSelect - Callback function to be called when a token is selected.
 * @param {Networks} [props.networks] - Optional list of networks to display in the dropdown. The dropdown won't show up if undefined. Default is undefined.
 * @param {string} [props.placeholder='Search by name or address'] - Optional placeholder text for the search input. Default is 'Search by name or address'.
 * @param {number} [props.containerHeight=320] - Optional height of the virtualized tokens list. Default is 320.
 * @param {number} [props.iconSize=32] - Optional size of the token icon in the list. Default is 32.
 * @param {number} [props.itemHeight=64] - Optional height of each item in the list. Default is 64.
 * @param {boolean} [props.showAddTokenButton=false] - Optional flag to allow adding a token. Default is false.
 * @param {boolean} [props.showBalance=false] - Optional flag to show the token balance in the list. Default is false.
 * @param {boolean} [props.showTopTokens=false] - Optional flag to show the top tokens in the list. Default is false.
 *
 * @remarks
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
 * Dropdown button:
 * * --theme-token-input-dropdown-button-background-color
 * * --theme-token-input-dropdown-button-background-color-hover
 * * --theme-token-input-dropdown-button-border-color
 * * --theme-token-input-dropdown-button-border-color-hover
 * * --theme-token-input-dropdown-button-border-color-active
 * * --theme-token-input-dropdown-button-color
 * * --theme-token-input-dropdown-button-color-hover
 * * --base-token-input-dropdown-button-padding
 * * --base-token-input-texfield-padding
 *
 * Max Button:
 * * --theme-token-input-max-button-background-color
 * * --theme-token-input-max-button-background-color-hover
 * * --theme-token-input-max-button-border-color
 * * --theme-token-input-max-button-border-color-hover
 * * --theme-token-input-max-button-border-color-active
 * * --theme-token-input-max-button-color
 * * --theme-token-input-max-button-color-hover
 *
 * Estimated USD Value
 * * --theme-token-input-estimated-usd-color
 *
 * Balance
 * *--theme-token-input-balance-color
 *
 */
const TokenInput: FC<TokenInputProps> = ({
  containerHeight,
  currentNetworkId,
  iconSize,
  itemHeight,
  networks,
  onAmountSet,
  onError,
  onTokenSelect,
  placeholder,
  showAddTokenButton,
  showBalance,
  showTopTokens,
  singleToken,
  thousandSeparator = true,
  title,
  token,
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
  } = useTokenInput(token)
  const { Dialog, close, open } = useDialog()
  const max = useMemo(
    () => (balance && selectedToken ? formatUnits(balance, selectedToken.decimals) : '0'),
    [balance, selectedToken],
  )

  const handleSetAmount = (amount: string) => {
    console.log('amount', amount)
    setAmount(amount)
    onAmountSet(amount)
  }

  const handleSelectedToken = (token: Token | undefined) => {
    handleSetAmount('') // reset amount when token change
    onTokenSelect?.(token)
    setTokenSelected(token)
    close('token-select')
  }

  const handleSetMax = () => {
    handleSetAmount(max)
  }

  const handleError: BigNumberInputProps['onError'] = (error) => {
    onError?.(error?.message)
    setAmountError(error?.message)
  }

  const showTokenSelect = () => {
    open('token-select')
  }

  const selectIconSize = 24
  const decimals = selectedToken ? selectedToken.decimals : 2

  if (singleToken && !token) {
    return <div>When single token is true, a token is required.</div>
  }

  return (
    <>
      <Wrapper {...restProps}>
        {title && <Title>{title}</Title>}
        <TopRow>
          <BigNumberInput
            decimals={decimals}
            max={max}
            onChange={handleSetAmount}
            onError={handleError}
            placeholder="0.00"
            renderInput={(renderInputProps) => (
              <TokenAmountField
                amountError={amountError}
                decimals={decimals}
                renderInputProps={renderInputProps}
                thousandSeparator={thousandSeparator}
              />
            )}
            value={amount}
          />
          <DropdownButton onClick={showTokenSelect} singleOption={singleToken}>
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
          </DropdownButton>
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
          showAddTokenButton={showAddTokenButton}
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

function TokenAmountField({
  amountError,
  decimals,
  renderInputProps,
  thousandSeparator,
}: {
  amountError?: string | null
  decimals: number
  renderInputProps: RenderInputProps
  thousandSeparator: boolean
}) {
  const { onChange, ...restProps } = renderInputProps

  const isAllowed = ({ value }: NumberFormatValues) => {
    const [, inputDecimals] = value.toString().split('.')

    if (!inputDecimals) {
      return true
    }

    return decimals >= inputDecimals?.length
  }

  return (
    <NumericFormat
      $status={amountError ? 'error' : undefined}
      customInput={Textfield}
      isAllowed={isAllowed}
      onValueChange={({ value }) => onChange?.(value)}
      thousandSeparator={thousandSeparator}
      // NumericFormat has defaultValue prop overwritten and is not compatible with the standard
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(restProps as any)}
    />
  )
}

function useTokenInput(token?: Token) {
  const [amount, setAmount] = useState('')
  const [amountError, setAmountError] = useState<string | null>()
  const [selectedToken, setTokenSelected] = useState<Token | undefined>(token)

  const { address: userWallet } = useAccount()
  const { balance, balanceError, isLoadingBalance } = useErc20Balance({
    address: userWallet ? getAddress(userWallet) : undefined,
    token: selectedToken,
  })

  const isNative = selectedToken?.address ? isNativeToken(selectedToken.address) : false
  const {
    data: nativeBalance,
    error: nativeBalanceError,
    isLoading: isLoadingNativeBalance,
  } = useBalance({
    address: userWallet ? getAddress(userWallet) : undefined,
    chainId: selectedToken?.chainId,
    query: {
      enabled: isNative,
    },
  })

  return {
    amount,
    setAmount,
    amountError,
    setAmountError,
    balance: isNative ? nativeBalance?.value : balance,
    balanceError: isNative ? nativeBalanceError : balanceError,
    isLoadingBalance: isNative ? isLoadingNativeBalance : isLoadingBalance,
    selectedToken,
    setTokenSelected,
  }
}

export default TokenInput
