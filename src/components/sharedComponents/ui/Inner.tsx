import { Flex, type FlexProps } from '@chakra-ui/react'
import type { FC } from 'react'

export const Inner: FC<FlexProps> = ({ children, ...restProps }) => (
  <Flex
    flexShrink={0}
    maxW="100%"
    mx="auto"
    px={{ base: 1, md: 2, xl: 4 }}
    w="1360px"
    {...restProps}
  >
    {children}
  </Flex>
)

export default Inner
