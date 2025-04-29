import {
  BigNumberInput,
  type BigNumberInputProps,
  type RenderInputProps,
} from '@/src/components/sharedComponents/BigNumberInput'
import {
  Balance,
  BalanceValue,
  BottomRow,
  CloseButton,
  DropdownButton,
  ErrorComponent,
  EstimatedUSDValue,
  Icon,
  MaxButton,
  SingleToken,
  Textfield,
  Title,
  TopRow,
  Wrapper,
} from '@/src/components/sharedComponents/TokenInput/Components'
import type { UseTokenInputReturnType } from '@/src/components/sharedComponents/TokenInput/useTokenInput'
import TokenLogo from '@/src/components/sharedComponents/TokenLogo'
import TokenSelect, { type TokenSelectProps } from '@/src/components/sharedComponents/TokenSelect'
import Spinner from '@/src/components/sharedComponents/ui/Spinner'
import type { Token } from '@/src/types/token'
import { Dialog, type FlexProps, Portal } from '@chakra-ui/react'
import { type FC, useMemo, useState } from 'react'
import { type NumberFormatValues, NumericFormat } from 'react-number-format'
import { formatUnits } from 'viem'
import styles from './styles'

interface TokenInputProps extends Omit<TokenSelectProps, 'onTokenSelect'> {
  singleToken?: boolean
  thousandSeparator?: boolean
  title?: string
  tokenInput: UseTokenInputReturnType
}

/** @ignore */
type Props = FlexProps & TokenInputProps

/**
 * TokenInput component allows users to input token amounts and select tokens from a list.
 * It displays the token input field, token balance, and a dropdown list of available tokens.
 *
 * @param {TokenInputProps} props - TokenInput component props.
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
 */
const TokenInput: FC<Props> = ({
  containerHeight,
  currentNetworkId,
  css,
  iconSize,
  itemHeight,
  networks,
  placeholder,
  showAddTokenButton,
  showBalance,
  showTopTokens,
  singleToken,
  thousandSeparator = true,
  title,
  tokenInput,
  ...restProps
}: Props) => {
  const [isOpen, setIsOpen] = useState(false)
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
  } = tokenInput

  const max = useMemo(
    () => (balance && selectedToken ? balance : BigInt(0)),
    [balance, selectedToken],
  )
  const selectIconSize = 24
  const decimals = selectedToken ? selectedToken.decimals : 2

  const handleSelectedToken = (token: Token | undefined) => {
    setAmount(BigInt(0))
    setTokenSelected(token)
    setIsOpen(false)
  }

  const handleSetMax = () => {
    setAmount(max)
  }

  const handleError: BigNumberInputProps['onError'] = (error) => {
    setAmountError(error?.message)
  }

  const CurrentToken = () =>
    selectedToken ? (
      <>
        <Icon $iconSize={selectIconSize}>
          <TokenLogo
            size={selectIconSize}
            token={selectedToken}
          />
        </Icon>
        {selectedToken.symbol}
      </>
    ) : (
      'Select'
    )

  return singleToken && !selectedToken ? (
    <div>When single token is true, a token is required.</div>
  ) : (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(state) => setIsOpen(state.open)}
    >
      <Wrapper
        css={{ ...css, ...styles }}
        {...restProps}
      >
        {title && <Title>{title}</Title>}
        <TopRow>
          <BigNumberInput
            decimals={decimals}
            max={max}
            onChange={setAmount}
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
          {singleToken ? (
            <SingleToken>
              <CurrentToken />
            </SingleToken>
          ) : (
            <Dialog.Trigger asChild>
              <DropdownButton>
                <CurrentToken />
              </DropdownButton>
            </Dialog.Trigger>
          )}
        </TopRow>
        <BottomRow>
          <EstimatedUSDValue>~$0.00</EstimatedUSDValue>
          <Balance>
            <BalanceValue>
              {balanceError && 'Error...'}
              {isLoadingBalance ? (
                <Spinner size="sm" />
              ) : (
                `Balance: ${formatUnits(balance ?? 0n, selectedToken?.decimals ?? 0)}`
              )}
            </BalanceValue>
            <MaxButton
              disabled={isLoadingBalance || !!balanceError || balance === 0n}
              onClick={handleSetMax}
            >
              Max
            </MaxButton>
          </Balance>
        </BottomRow>
        {amountError && <ErrorComponent>{amountError}</ErrorComponent>}
      </Wrapper>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
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
            >
              <CloseButton onClick={() => setIsOpen(false)} />
            </TokenSelect>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
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
  const { onChange, inputRef, ...restProps } = renderInputProps

  const isAllowed = ({ value }: NumberFormatValues) => {
    const [inputDecimals] = value.toString().split('.')

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
      // biome-ignore lint/suspicious/noExplicitAny: NumericFormat has defaultValue prop overwritten and is not compatible with the standard
      {...(restProps as any)}
    />
  )
}

export default TokenInput
