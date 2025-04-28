import { Box, type BoxProps } from '@chakra-ui/react'
import type { FC } from 'react'
import styles from './styles'

interface SkeletonProps extends BoxProps {
  $animate?: boolean
  $animationDuration?: string
}

/**
 * @name SkeletonLoading
 * @description A loading skeleton component
 * @param {boolean} [$animate] - Whether the loading animation should be displayed. Default is true.
 */
const SkeletonLoading: FC<SkeletonProps> = ({
  $animate = true,
  $animationDuration = '2s',
  css,
  ...restProps
}: SkeletonProps) => (
  <Box
    animationDelay="0s"
    animation={$animate ? 'loadingAnimation' : 'none'}
    animationDuration={$animationDuration}
    animationIterationCount="infinite"
    animationTimingFunction="ease-in-out"
    backgroundColor="var(--theme-skeleton-loading-background-color)"
    borderRadius={8}
    css={{ ...css, ...styles }}
    height="20px"
    width="50px"
    {...restProps}
  />
)

export default SkeletonLoading
