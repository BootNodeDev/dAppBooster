import { Flex, type FlexProps } from '@chakra-ui/react'
import type { FC } from 'react'

export const Inner: FC<FlexProps> = ({ children, ...restProps }) => (
  <Flex
    flexShrink={0}
    maxW="100%"
    mx="auto"
    px={{ base: 2, md: 3, xl: 4 }}
    w="1440px"
    {...restProps}
  >
    {children}
  </Flex>
)

export default Inner
