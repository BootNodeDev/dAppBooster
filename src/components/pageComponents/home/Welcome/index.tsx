import { type FC, type HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

import {
  Title as BasetTitle,
  Text as BaseText,
  InnerContainer as Inner,
  ContainerPadding,
  breakpointMediaQuery,
} from 'db-ui-toolkit'

import { LightClouds, DarkClouds } from '@/src/components/pageComponents/home/Welcome/Clouds'
import DocsButton from '@/src/components/pageComponents/home/Welcome/DocsButton'
import BaseGhost from '@/src/components/pageComponents/home/Welcome/Ghost'
import GitClone from '@/src/components/pageComponents/home/Welcome/GitClone'
import GithubButton from '@/src/components/pageComponents/home/Welcome/GithubButton'

const Wrapper = styled.section`
  [data-theme='light'] & {
    --landing-page-main-background-color: #f7f7f7;
  }

  [data-theme='dark'] & {
    --landing-page-main-background-color: #2e3048;
  }

  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 0;

  ${breakpointMediaQuery(
    'desktopStart',
    css`
      min-height: 100vh;
    `,
  )}
`

const Clouds = styled.div`
  display: flex;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    background-color: var(--landing-page-main-background-color);
    display: block;
    flex-grow: 1;
    flex-shrink: 1;
    min-width: 0;
  }
`

const Ghost = styled(BaseGhost)`
  bottom: -5px;
  height: 191px;
  left: 50%;
  object-fit: cover;
  position: absolute;
  transform: translateX(-50%);
  width: 100px;
  z-index: 1;

  ${breakpointMediaQuery(
    'desktopStart',
    css`
      bottom: 70px;
      height: auto;
      object-fit: none;
      width: auto;
    `,
  )}
`

const Contents = styled.div`
  flex-grow: 1;
  background-color: var(--landing-page-main-background-color);
`

const InnerContainer = styled(Inner)`
  align-items: center;
  flex-direction: column;

  ${ContainerPadding}
`

const Title = styled(BasetTitle)`
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: var(--base-gap);
  text-align: center;
  padding-top: calc(var(--base-common-padding-xl) * 2);

  ${breakpointMediaQuery(
    'desktopStart',
    css`
      font-size: 4.8rem;
      padding-top: 0;
    `,
  )}
`

const Text = styled(BaseText)`
  font-size: 1.6rem;
  line-height: 1.5;
  margin-bottom: calc(var(--base-gap) * 4);
  text-align: center;

  br {
    display: none;
  }

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      br {
        display: block;
      }
    `,
  )}

  ${breakpointMediaQuery(
    'desktopStart',
    css`
      font-size: 1.8rem;
    `,
  )}
`

const Buttons = styled.div`
  display: flex;
  gap: calc(var(--base-gap) + var(--base-gap) / 2);
  justify-content: center;
  margin-bottom: calc(var(--base-gap) * 4);
`

const Welcome: FC<HTMLAttributes<HTMLElement>> = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Clouds>
        <LightClouds />
        <DarkClouds />
        <Ghost />
      </Clouds>
      <Contents>
        <InnerContainer>
          <Title>
            Boost dApp
            <br />
            development on the
            <br /> blockchain
          </Title>
          <Text>
            A modern blockchain boilerplate built to quickly get
            <br /> you started with your next project.
          </Text>
          <Buttons>
            <GithubButton />
            <DocsButton />
          </Buttons>
          <GitClone />
        </InnerContainer>
      </Contents>
    </Wrapper>
  )
}

export default Welcome
