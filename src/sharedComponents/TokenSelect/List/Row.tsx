import { type FC, HTMLAttributes } from 'react'
import styled from 'styled-components'

import { formatUnits } from 'viem'

import TokenLogo from '@/src/sharedComponents/TokenLogo'
import { type Token } from '@/src/types/token'
import { TokenWithAmount } from '@/src/utils/tokensBalanceCache'

const Name = styled.div.attrs(({ className = 'tokenSelectRowName' }) => ({ className }))`
  color: var(--theme-token-select-row-token-name-color-default);
  font-size: 1.8rem;
  font-weight: 500;
  line-height: 1.2;
`

const Balance = styled.div.attrs(({ className = 'tokenSelectRowBalance' }) => ({ className }))`
  color: var(--theme-token-select-row-token-balance-color-default);
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.2;
`

const Value = styled.div.attrs(({ className = 'tokenSelectRowValue' }) => ({ className }))`
  color: var(--theme-token-select-row-token-value-color-default);
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.2;
`

const Wrapper = styled.div.attrs(({ className = 'tokenSelectListRow', tabIndex = 0 }) => ({
  tabIndex,
  className,
}))`
  --theme-token-select-row-background-color-default: var(
    --theme-token-select-row-background-color,
    transparent
  );
  --theme-token-select-row-background-color-hover-default: var(
    --theme-token-select-row-background-color-hover,
    rgb(0 0 0 / 5%)
  );
  --theme-token-select-row-token-name-color-default: var(
    --theme-token-select-row-token-name-color,
    #2e3048
  );
  --theme-token-select-row-token-balance-color-default: var(
    --theme-token-select-row-token-balance-color,
    #2e3048
  );
  --theme-token-select-row-token-value-color-default: var(
    --theme-token-select-row-token-value-color,
    #2e3048
  );

  align-items: center;
  background-color: var(--theme-token-select-row-background-color-default);
  column-gap: var(--base-gap-xl);
  cursor: pointer;
  display: flex;
  height: 100%;
  padding-left: calc(var(--base-token-select-horizontal-padding) + var(--base-common-padding));
  padding-right: calc(var(--base-token-select-horizontal-padding) + var(--base-common-padding));
  transition: background-color var(--base-animation-time-sm) ease-in-out;
  width: 100%;

  &:hover {
    background-color: var(--theme-token-select-row-background-color-hover-default);

    ${Name} {
      color: var(
        --theme-token-select-row-token-name-color-hover,
        var(--theme-token-select-row-token-name-color-default)
      );
    }

    ${Balance} {
      color: var(
        --theme-token-select-row-token-balance-color-hover,
        var(--theme-token-select-row-token-balance-color-default)
      );
    }

    ${Value} {
      color: var(
        --theme-token-select-row-token-value-color-hover,
        var(--theme-token-select-row-token-value-color-default)
      );
    }
  }

  &:active {
    opacity: 0.8;
  }
`

const Icon = styled.div.attrs<{ size: number }>(({ className = 'tokenSelectRowIcon' }) => ({
  className,
}))`
  align-items: center;
  border-radius: 50%;
  display: flex;
  height: ${({ size }) => size}px;
  justify-content: center;
  overflow: hidden;
  width: ${({ size }) => size}px;
`

const Values = styled.div.attrs(({ className = 'tokenSelectRowValues' }) => ({ className }))`
  display: flex;
  flex-direction: column;
  margin-left: auto;
  row-gap: var(--base-gap-sm);
  align-items: flex-end;
`
/**
 * @name TokenBalance
 * @description The token balance in the token list row.
 *
 * @param {TokenWithAmount} token - The token object containing the amount, decimals, and price in USD.
 */
const TokenBalance = ({ token }: { token: TokenWithAmount }) => {
  const balance = formatUnits(token.amount, token.decimals)
  const value = (parseFloat(token.priceUSD) * parseFloat(balance)).toFixed(2)

  return (
    <Values>
      <Balance>{balance}</Balance>
      <Value>$ {value}</Value>
    </Values>
  )
}

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  iconSize: number
  onClick: (token: Token | TokenWithAmount) => void
  showBalance?: boolean
  token: Token | TokenWithAmount
}

/**
 * @name Row
 * @description A row in the token select list.
 *
 * @param {Token | TokenWithAmount} token - The token to display.
 * @param {number} iconSize - The size of the token icon.
 * @param {(token: Token | TokenWithAmount) => void} onClick - Callback function to be called when the row is clicked.
 * @param {boolean} [showBalance=false] - Optional flag to show the token balance. Default is false.
 */
const Row: FC<Props> = ({ iconSize, onClick, showBalance, token, ...restProps }) => {
  const { name } = token

  return (
    <Wrapper onClick={() => onClick(token)} {...restProps}>
      <Icon size={iconSize}>
        <TokenLogo size={iconSize} token={token} />
      </Icon>
      <Name>{name}</Name>
      {showBalance && <TokenBalance token={token as TokenWithAmount} />}
    </Wrapper>
  )
}

export default Row
