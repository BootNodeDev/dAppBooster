import { Box, type BoxProps } from '@chakra-ui/react'
import type { FC } from 'react'

interface SkeletonProps extends BoxProps {
  $animate?: boolean
  $animationDuration?: string
}

/**
 * @name SkeletonLoading
 *
 * @description A loading skeleton component
 *
 * @param {boolean} [$animate=true] - Whether the loading animation should be displayed. Default is true.
 * @param {string} [$animationDuration='2s'] - The duration of the loading animation. Default is '2s'.
 */
const SkeletonLoading: FC<SkeletonProps> = ({
  $animate = true,
  $animationDuration = '2s',
  ...restProps
}) => (
  <Box
    animationDelay="0s"
    animation={$animate ? 'loadingAnimation' : 'none'}
    animationDuration={$animationDuration}
    animationIterationCount="infinite"
    animationTimingFunction="ease-in-out"
    backgroundColor="var(--theme-skeleton-loading-background-color)"
    borderRadius={8}
    height="20px"
    width="50px"
    {...restProps}
  />
)

export default SkeletonLoading
