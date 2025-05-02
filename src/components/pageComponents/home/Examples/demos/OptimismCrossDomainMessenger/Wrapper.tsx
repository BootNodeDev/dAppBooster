import { Flex, Heading } from '@chakra-ui/react'
import type { ComponentProps, FC, ReactNode } from 'react'

interface Props extends Omit<ComponentProps<'div'>, 'title'> {
  title: string | ReactNode
}

const WrapperComponent: FC<Props> = ({ children, title, ...restProps }) => {
  return (
    <Flex
      css={{
        '.light &': {
          '--theme-op-background': '#fff',
          '--theme-op-title-color': '#2e3048',
          '--theme-op-text-color': '#2e3048',
        },
        '.dark &': {
          '--theme-op-background': '#373954',
          '--theme-op-title-color': '#fff',
          '--theme-op-text-color': '#e2e0e7',
        },
        '& p': {
          fontSize: '15px',
          lineHeight: '1.2',
          margin: 0,

          '&, & a': {
            color: 'var(--theme-op-text-color)',
          },
          '& a:hover': {
            textDecoration: 'none',
          },
        },
      }}
      backgroundColor="var(--theme-op-background)"
      borderRadius="8px"
      flexDirection="column"
      marginTop={{ lg: 6 }}
      padding={4}
      rowGap={6}
      width="100%"
      {...restProps}
    >
      <Heading
        as="h3"
        color="var(--theme-op-title-color)"
        fontSize="14px"
        fontWeight="700"
        lineHeight="1.2"
        margin="0"
      >
        {title}
      </Heading>
      {children}
    </Flex>
  )
}

export default WrapperComponent
