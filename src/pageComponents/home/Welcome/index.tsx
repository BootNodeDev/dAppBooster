import React from 'react'
import styled from 'styled-components'

import {
  Title as BasetTitle,
  Text as BaseText,
  InnerContainer as Inner,
  ContainerPadding,
} from 'db-ui-toolkit'

import { LightClouds, DarkClouds } from '@/src/pageComponents/home/Welcome/Clouds'
import DocsButton from '@/src/pageComponents/home/Welcome/DocsButton'
import BaseGhost from '@/src/pageComponents/home/Welcome/Ghost'
import GithubButton from '@/src/pageComponents/home/Welcome/GithubButton'

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  max-height: 1080px;
  min-height: 100vh;
  position: relative;
  z-index: 0;
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
  bottom: 70px;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  z-index: 1;
`

const Contents = styled.div`
  flex-grow: 1;
  max-width: 100%;
  background-color: var(--landing-page-main-background-color);
`

const InnerContainer = styled(Inner)`
  align-items: center;
  flex-direction: column;

  ${ContainerPadding}
`

const Title = styled(BasetTitle)`
  font-size: 4.8rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: var(--base-gap);
  text-align: center;
`

const Text = styled(BaseText)`
  font-size: 1.8rem;
  line-height: 1.5;
  margin-bottom: calc(var(--base-gap) * 4);
  text-align: center;
`

const Buttons = styled.div`
  display: flex;
  gap: calc(var(--base-gap) + var(--base-gap) / 2);
  justify-content: center;
  margin-bottom: calc(var(--base-gap) * 4);
`

const Welcome: React.FC = ({ ...restProps }) => {
  return (
    <Wrapper id="top" {...restProps}>
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
        </InnerContainer>
      </Contents>
    </Wrapper>
  )
}

export default Welcome
