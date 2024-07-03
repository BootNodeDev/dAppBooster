import { type ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

import TokenLogo from '@/src/sharedComponents/TokenLogo'
import { type Token } from '@/src/types/token'

const ICON_SIZE = 24

const Wrapper = styled.button.attrs(({ className = 'tokenSelectPill' }) => ({ className }))`
  [data-theme='light'] & {
    --theme-token-select-pill-border-color: #e2e0e7;
    --theme-token-select-pill-color: #2e3048;
    --theme-token-select-pill-background-color-hover: rgb(0 0 0 / 5%);
  }

  [data-theme='dark'] & {
    --theme-token-select-pill-border-color: #4b4d60;
    --theme-token-select-pill-color: #fff;
    --theme-token-select-pill-background-color-hover: rgb(255 255 255 / 5%);
  }

  align-items: center;
  background-color: transparent;
  border-radius: var(--base-border-radius);
  border: 1px solid var(--theme-token-select-pill-border-color);
  column-gap: var(--base-gap);
  cursor: pointer;
  display: grid;
  grid-template-columns: ${ICON_SIZE}px 1fr;
  height: 41px;
  padding: 0 var(--base-common-padding-xl);
  transition: background-color var(--base-animation-time-sm) ease-in-out;

  &:hover {
    background-color: var(--theme-token-select-pill-background-color-hover);
  }
`

const Icon = styled.div`
  align-items: center;
  border-radius: 50%;
  display: flex;
  height: ${ICON_SIZE}px;
  justify-content: center;
  overflow: hidden;
  width: ${ICON_SIZE}px;
`

const Symbol = styled.div`
  color: var(--theme-token-select-pill-color);
  font-size: 1.8rem;
  font-weight: 500;
  line-height: 1.2;
`

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  token: Token
}

const Pill: React.FC<Props> = ({ token, ...restProps }: Props) => {
  const { symbol } = token

  return (
    <Wrapper {...restProps}>
      <Icon>
        <TokenLogo size={ICON_SIZE} token={token} />
      </Icon>
      <Symbol>{symbol}</Symbol>
    </Wrapper>
  )
}

export default Pill
