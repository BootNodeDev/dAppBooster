import ImgGhostDark from '@/src/components/pageComponents/home/Welcome/Ghost/assets/img-ghost-dark.svg'
import ImgGhostLight from '@/src/components/pageComponents/home/Welcome/Ghost/assets/img-ghost-light.svg'
import { Image, type ImageProps } from '@chakra-ui/react'
import type { FC } from 'react'

const Ghost: FC<ImageProps> = () => (
  <Image
    css={{
      '.light &': {
        '--ghost-image': `url(${ImgGhostLight})`,
      },
      '.dark &': {
        '--ghost-image': `url(${ImgGhostDark})`,
      },
    }}
    bottom={{ base: '-5px', lg: '70px' }}
    content="var(--ghost-image)"
    flexGrow={0}
    flexShrink={0}
    height={{ base: '191px', lg: 'auto' }}
    left="50%"
    objectFit={{ base: 'cover', lg: 'none' }}
    position="absolute"
    transform="translateX(-50%)"
    width={{ base: '100px', lg: 'auto' }}
    zIndex={1}
  />
)

export default Ghost
