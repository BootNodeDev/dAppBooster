import Socials from '@/src/components/sharedComponents/ui/Footer/Socials'
import {
  Footer as BaseFooter,
  ContainerPadding,
  InnerContainer,
  LogoMini,
} from '@bootnodedev/db-ui-toolkit'
import packageJSON from '@packageJSON'
import type { FC } from 'react'
import styled from 'styled-components'

export const Wrapper = styled(BaseFooter)`
  color: var(--theme-footer-text-color);
  flex-direction: column;
  height: 92px;
  row-gap: var(--base-gap);
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

const AppVersion = styled.div`
  font-size: 1.2rem;
  line-height: 1.2;
  margin-top: var(--base-gap);
`

export const Footer: FC = ({ ...restProps }) => {
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
      <AppVersion>Version: {packageJSON.version}</AppVersion>
    </Wrapper>
  )
}
