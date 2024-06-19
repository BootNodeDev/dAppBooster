import styled from 'styled-components'

import { InnerContainer, Footer as BaseFooter, LogoMini, ContainerPadding } from 'db-ui-toolkit'

import Socials from '@/src/sharedComponents/Footer/Socials'

export const Wrapper = styled(BaseFooter)`
  color: var(--theme-footer-text-color);
  height: 92px;
`

const Inner = styled(InnerContainer)`
  align-items: center;
  column-gap: calc(var(--base-gap) + var(--base-gap) / 2);
  justify-content: center;

  ${ContainerPadding}
`

const Line = styled.div`
  [data-theme='light'] & {
    background-color: #c5c2cb;
  }

  [data-theme='dark'] & {
    background-color: #5f6178;
  }

  height: 17px;
  width: 1px;
`

export const Footer: React.FC = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Inner>
        <a
          href="https://www.bootnode.dev/"
          rel="noreferrer"
          target="_blank"
          title="Building the future of Web3"
        >
          <LogoMini />
        </a>
        <Line />
        <Socials />
      </Inner>
    </Wrapper>
  )
}
