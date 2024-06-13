import styled from 'styled-components'

import ImgCloudsDark from '@/src/pageComponents/home/WelcomeSection/Clouds/assets/img-clouds-dark.svg'
import ImgCloudsLight from '@/src/pageComponents/home/WelcomeSection/Clouds/assets/img-clouds-light.svg'

const Clouds = styled.img`
  display: none;
  object-fit: cover;
  object-position: center;
  min-width: fit-content;
  flex-grow: 0;
  flex-shrink: 0;
`

Clouds.defaultProps = {
  alt: '',
}

export const DarkClouds = styled(Clouds)`
  [data-theme='dark'] & {
    display: block;
  }
`

DarkClouds.defaultProps = {
  src: ImgCloudsDark,
}

export const LightClouds = styled(Clouds)`
  [data-theme='light'] & {
    display: block;
  }
`

LightClouds.defaultProps = {
  src: ImgCloudsLight,
}
