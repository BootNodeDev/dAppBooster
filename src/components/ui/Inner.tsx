import { Flex } from '@chakra-ui/react'
import type { ComponentPropsWithoutRef, FC } from 'react'

export const Inner: FC<ComponentPropsWithoutRef<'div'>> = ({ children, ...restProps }) => (
  <Flex
    align="center"
    justify="space-between"
    flexShrink={0}
    h="100%"
    mx="auto"
    maxW="100%"
    px={{ base: 1, md: 2, xl: 4 }}
    w="var(--base-container-max-width)"
    {...restProps}
  >
    {children}
  </Flex>
)
