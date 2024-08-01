import styled, { css } from 'styled-components'

import { breakpointMediaQuery } from 'db-ui-toolkit'

import ImgCloudsDark from '@/src/pageComponents/home/Welcome/Clouds/assets/img-clouds-dark.svg'
import ImgCloudsLight from '@/src/pageComponents/home/Welcome/Clouds/assets/img-clouds-light.svg'

const Clouds = styled.img`
  display: none;
  flex-grow: 0;
  flex-shrink: 0;
  min-height: 306px;
  min-width: calc(100vw + 400px);
  object-fit: contain;
  object-position: center bottom;

  ${breakpointMediaQuery(
    'desktopStart',
    css`
      min-width: fit-content;
      object-fit: cover;
      object-position: center;
    `,
  )}
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
