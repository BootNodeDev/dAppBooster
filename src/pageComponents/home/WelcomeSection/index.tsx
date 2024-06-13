import React from 'react'
import styled from 'styled-components'

import { Title, InnerContainer as Inner, ContainerPadding } from 'db-ui-toolkit'

import { LightClouds, DarkClouds } from '@/src/pageComponents/home/WelcomeSection/Clouds'
import BaseGhost from '@/src/pageComponents/home/WelcomeSection/Ghost'

const Wrapper = styled.section`
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
  max-width: 100%;
  background-color: var(--landing-page-main-background-color);
`

const InnerContainer = styled(Inner)`
  align-items: center;
  flex-direction: column;

  ${ContainerPadding}
`

const WelcomeSection: React.FC = ({ ...restProps }) => {
  return (
    <Wrapper id="top" {...restProps}>
      <Clouds>
        <LightClouds />
        <DarkClouds />
        <Ghost />
      </Clouds>
      <Contents>
        <InnerContainer>
          <Title>Welcome to dApp👻ster!</Title>
        </InnerContainer>
      </Contents>
    </Wrapper>
  )
}

export default WelcomeSection
