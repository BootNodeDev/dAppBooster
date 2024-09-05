import { type FC, type HTMLAttributes } from 'react'
import styled from 'styled-components'

import { SkeletonLoading } from '@bootnodedev/db-ui-toolkit'

import TokenLogo from '@/src/components/sharedComponents/TokenLogo'
import AddERC20TokenButton from '@/src/components/sharedComponents/TokenSelect/List/AddERC20TokenButton'
import TokenBalance, {
  Balance,
  Value,
} from '@/src/components/sharedComponents/TokenSelect/List/TokenBalance'
import { SecondaryButton } from '@/src/components/sharedComponents/ui/Buttons'
import { type Token } from '@/src/types/token'

const Name = styled.div.attrs(({ className = 'tokenSelectRowName' }) => {
  return { className }
})`
  color: var(--theme-token-select-row-token-name-color, #2e3048);
  font-size: 1.8rem;
  font-weight: 500;
  line-height: 1.2;
`

const Wrapper = styled.div.attrs(({ className = 'tokenSelectListRow', tabIndex = 0 }) => {
  return {
    tabIndex,
    className,
  }
})`
  align-items: center;
  background-color: var(--theme-token-select-row-background-color, transparent);
  column-gap: var(--base-gap-xl, 16px);
  cursor: pointer;
  display: flex;
  height: 100%;
  padding-left: calc(var(--base-common-padding-xl, 16px) + var(--base-common-padding, 8px));
  padding-right: calc(var(--base-common-padding-xl, 16px) + var(--base-common-padding, 8px));
  transition: background-color var(--base-transition-duration-sm, 0.2s) ease-in-out;
  width: 100%;

  &:hover {
    background-color: var(--theme-token-select-row-background-color-hover, rgb(0 0 0 / 5%));

    ${Name} {
      color: var(
        --theme-token-select-row-token-name-color-hover,
        var(--theme-token-select-row-token-name-color, #2e3048)
      );
    }

    ${Balance} {
      color: var(
        --theme-token-select-row-token-balance-color-hover,
        var(--theme-token-select-row-token-balance-color, #2e3048)
      );
    }

    ${Value} {
      color: var(
        --theme-token-select-row-token-value-color-hover,
        var(--theme-token-select-row-token-value-color, #2e3048)
      );
    }
  }

  &:active {
    opacity: 0.8;
  }
`

const RightColumn = styled.div`
  margin-left: auto;
`

const Icon = styled.div.attrs<{ size: number }>(({ className = 'tokenSelectRowIcon' }) => {
  return {
    className,
  }
})`
  align-items: center;
  border-radius: 50%;
  display: flex;
  height: ${({ size }) => size}px;
  justify-content: center;
  overflow: hidden;
  width: ${({ size }) => size}px;
`

interface TokenSelectRowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  iconSize: number
  isLoadingBalances?: boolean
  onClick: (token: Token) => void
  showAddTokenButton?: boolean
  showBalance?: boolean
  token: Token
}

const BalanceLoading = styled.div.attrs(() => {
  return {
    children: (
      <>
        <SkeletonLoading style={{ height: '19px', width: '50px' }} />
        <SkeletonLoading style={{ height: '14px', width: '50px' }} />
      </>
    ),
  }
})`
  display: flex;
  flex-direction: column;
  row-gap: var(--base-gap-sm, 4px);
  align-items: flex-end;
`

/**
 * A row in the token select list.
 *
 * @param {object} props - TokenSelect List's Row props.
 * @param {Token} prop.token - The token to display.
 * @param {number} prop.iconSize - The size of the token icon.
 * @param {(token: Token) => void} prop.onClick - Callback function to be called when the row is clicked.
 * @param {boolean} prop.showAddTokenButton - Whether to display an add token button.
 * @param {boolean} [prop.showBalance=false] - Optional flag to show the token balance. Default is false.
 * @param {boolean} [prop.showBalance=false] - Optional flag to inform the balances are being loaded. Default is false.
 */
const Row: FC<TokenSelectRowProps> = ({
  iconSize,
  isLoadingBalances,
  onClick,
  showAddTokenButton,
  showBalance,
  token,
  ...restProps
}) => {
  const { name } = token

  return (
    <Wrapper onClick={() => onClick(token)} {...restProps}>
      <Icon size={iconSize}>
        <TokenLogo size={iconSize} token={token} />
      </Icon>
      <Name>{name}</Name>
      {showAddTokenButton && <AddERC20TokenButton $token={token}>Add token</AddERC20TokenButton>}
      {showBalance && (
        <RightColumn>
          <TokenBalance
            isLoading={isLoadingBalances}
            suspenseFallback={<BalanceLoading />}
            token={token}
          />
        </RightColumn>
      )}
    </Wrapper>
  )
}

export default Row
