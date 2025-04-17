import { Flex, type FlexProps } from '@chakra-ui/react'
import type { FC } from 'react'

const Badge: FC<FlexProps> = ({ children = <>Demo</>, ...restProps }) => {
  return (
    <Flex
      css={{
        "[data-theme='light'] &": {
          '--theme-examples-badge-background-color': '#2e3048',
        },
        "[data-theme='dark'] &": {
          '--theme-examples-badge-background-color': '#4b4d60',
        },
        '--badge-gap': '12px',
      }}
      alignItems="center"
      backgroundColor="var(--theme-examples-badge-background-color)"
      borderRadius="var(--base-border-radius-sm)"
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
