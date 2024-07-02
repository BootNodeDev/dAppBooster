import { type FC, HTMLAttributes } from 'react'
import styled from 'styled-components'

import TokenLogo from '@/src/sharedComponents/TokenLogo'
import { type Token } from '@/src/types/token'

const Wrapper = styled.div`
  [data-theme='light'] & {
    --theme-row-background-hover: rgb(0 0 0 / 5%);
    --theme-row-token-name-color: #2e3048;
    --theme-row-token-balance-color: #2e3048;
    --theme-row-token-value-color: #2e3048;
  }

  [data-theme='dark'] & {
    --theme-row-background-hover: rgb(255 255 255 / 5%);
    --theme-row-token-name-color: #fff;
    --theme-row-token-balance-color: #fff;
    --theme-row-token-value-color: #fff;
  }

  align-items: center;
  column-gap: var(--base-gap-xl);
  cursor: pointer;
  display: flex;
  height: 100%;
  padding-left: calc(var(--base-common-padding) * 3);
  padding-right: calc(var(--base-common-padding) * 3);
  transition: background-color var(--base-animation-time-sm) ease-in-out;
  width: 100%;

  &:hover {
    background-color: var(--theme-row-background-hover);
  }
`

const Icon = styled.div<{ size: number }>`
  align-items: center;
  border-radius: 50%;
  display: flex;
  height: ${({ size }) => size}px;
  justify-content: center;
  overflow: hidden;
  width: ${({ size }) => size}px;
`

const Name = styled.div`
  color: var(--theme-row-token-name-color);
  font-size: 1.8rem;
  font-weight: 500;
  line-height: 1.2;
`

const Values = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: auto;
  row-gap: var(--base-gap-sm);
  align-items: flex-end;
`

const Balance = styled.div`
  color: var(--theme-row-token-balance-color);
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.2;
`

const Value = styled.div`
  color: var(--theme-row-token-value-color);
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.2;
`

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  iconSize: number
  onClick: (token: Token) => void
  showBalance?: boolean
  showValue?: boolean
  token: Token
}

const Row: FC<Props> = ({ iconSize, onClick, showBalance, showValue, token, ...restProps }) => {
  const { name } = token

  return (
    <Wrapper onClick={() => onClick(token)} {...restProps}>
      <Icon size={iconSize}>
        <TokenLogo size={iconSize} token={token} />
      </Icon>
      <Name>{name}</Name>
      <Values>
        {showBalance && <Balance>1000.00</Balance>}
        {showValue && <Value>$10.00</Value>}
      </Values>
    </Wrapper>
  )
}

export default Row
