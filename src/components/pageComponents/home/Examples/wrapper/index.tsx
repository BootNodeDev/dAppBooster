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
          '--theme-wrapper-background': '#fff',
          '--theme-wrapper-border': '#0000000d',
          '--theme-wrapper-title-color': '#2e3048',
          '--theme-wrapper-text-color': '#2e3048',
        },
        '.dark &': {
          '--theme-wrapper-background': '#373954',
          '--theme-wrapper-border': '#ffffff14',
          '--theme-wrapper-title-color': '#fff',
          '--theme-wrapper-text-color': '#e2e0e7',
        },
        '& p': {
          fontSize: '15px',
          lineHeight: '1.4',
          margin: 0,

          '&, & a': {
            color: 'var(--theme-wrapper-text-color)',
          },
          '& a:hover': {
            textDecoration: 'none',
          },
        },
      }}
      backgroundColor="var(--theme-wrapper-background)"
      borderRadius="8px"
      flexDirection="column"
      marginTop={{ lg: 6 }}
      padding={4}
      paddingTop={8}
      rowGap={6}
      width="100%"
      {...restProps}
    >
      <Heading
        as="h3"
        color="var(--theme-wrapper-title-color)"
        fontSize="16px"
        fontWeight="700"
        lineHeight="1.2"
        margin="0"
        borderBottomWidth="1px"
        borderColor="var(--theme-wrapper-border)"
        borderBottomStyle="solid"
        paddingBottom={2}
      >
        {title}
      </Heading>
      {children}
    </Flex>
  )
}

export default WrapperComponent
