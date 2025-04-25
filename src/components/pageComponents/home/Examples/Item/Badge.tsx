import { Flex, type FlexProps } from '@chakra-ui/react'
import type { FC } from 'react'

const Badge: FC<FlexProps> = ({ children = <>Demo</>, ...restProps }) => {
  return (
    <Flex
      css={{
        '.light &': {
          '--theme-examples-badge-background-color': '#2e3048',
        },
        '.dark &': {
          '--theme-examples-badge-background-color': '#4b4d60',
        },
        '--badge-gap': '12px',
      }}
      alignItems="center"
      backgroundColor="var(--theme-examples-badge-background-color)"
      borderRadius="2px"
      color="#fff"
      display="flex"
      fontSize="12px"
      fontWeight={500}
      height="20px"
      left="var(--badge-gap)"
      lineHeight="1"
      paddingX={2}
      paddingY={0}
      position="absolute"
      top="var(--badge-gap)"
      {...restProps}
    >
      {children}
    </Flex>
  )
}

export default Badge
