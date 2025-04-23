import { Flex, type FlexProps } from '@chakra-ui/react'
import type { FC } from 'react'

export const Toast: FC<FlexProps> = ({ ...restProps }) => (
  <Flex
    css={{
      '@starting-style': {
        opacity: 0,
      },
    }}
    alignItems="center"
    backgroundColor="var(--theme-toast-background-color)"
    borderRadius="sm"
    color={'var(--theme-toast-color)'}
    display="flex"
    fontSize="13px"
    fontWeight="500"
    lineHeight="1.3"
    maxWidth="250px"
    padding={4}
    transition="display var(--base-transition-duration-sm) ease-out allow-discrete, opacity var(--base-transition-duration-sm) ease-out"
    wordBreak="break-word"
    {...restProps}
  />
)

export default Toast
