import ImgCloudsDark from '@/src/components/pageComponents/home/Welcome/Clouds/assets/img-clouds-dark.svg'
import ImgCloudsLight from '@/src/components/pageComponents/home/Welcome/Clouds/assets/img-clouds-light.svg'
import { Image, type ImageProps } from '@chakra-ui/react'
import type { FC } from 'react'

const styles = {
  display: 'none',
  flexGrow: '0',
  flexShrink: '0',
  minHeight: '306px',
  minWidth: { base: 'calc(100vw + 400px)', lg: 'fit-content' },
  objectFit: { base: 'contain', lg: 'cover' },
  objectPosition: { base: 'center bottom', lg: 'center' },
}

export const DarkClouds: FC<ImageProps> = () => (
  <Image
    css={{
      '[data-theme="dark"] &': {
        display: 'block',
      },
    }}
    src={ImgCloudsDark}
    {...styles}
  />
)

export const LightClouds: FC<ImageProps> = () => (
  <Image
    css={{
      '[data-theme="light"] &': {
        display: 'block',
      },
    }}
    src={ImgCloudsLight}
    {...styles}
  />
)
