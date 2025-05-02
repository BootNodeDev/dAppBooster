import { Flex, Heading, Span } from '@chakra-ui/react'
import type { ComponentProps, FC, ReactNode } from 'react'

interface Props extends Omit<ComponentProps<'div'>, 'title'> {
  text?: string | ReactNode
  title: string | ReactNode
}

const WrapperComponent: FC<Props> = ({ children, text, title, ...restProps }) => {
  return (
    <Flex
      css={{
        '.light &': {
          '--theme-token-ens-name-background': '#fff',
          '--theme-token-ens-name-title-color': '#2e3048',
          '--theme-token-ens-name-text-color': '#2e3048',
          '--theme-textfield-color': '#2e3048',
          '--theme-textfield-background-color': '#fff',
          '--theme-textfield-background-color-active': 'rgb(0 0 0 / 5%)',
          '--theme-textfield-border-color': '#c5c2cb',
          '--theme-textfield-placeholder-color': 'rgb(22 29 26 / 60%)',
        },
        '.dark &': {
          '--theme-token-ens-name-background': '#373954',
          '--theme-token-ens-name-title-color': '#fff',
          '--theme-token-ens-name-text-color': '#e2e0e7',
          '--theme-textfield-color': '#fff',
          '--theme-textfield-background-color': '#373954',
          '--theme-textfield-background-color-active': 'rgb(255 255 255 / 5%)',
          '--theme-textfield-border-color': '#5f6178',
          '--theme-textfield-placeholder-color': 'rgb(247 247 247 / 60%)',
        },
      }}
      backgroundColor="var(--theme-token-ens-name-background)"
      borderRadius="8px"
      flexDirection="column"
      p={4}
      rowGap={6}
      width="100%"
      {...restProps}
    >
      <Heading
        as="h3"
        color="var(--theme-token-ens-name-title-color)"
        fontSize="14px"
        fontWeight={700}
        lineHeight={1.2}
        m="0"
      >
        {title}
      </Heading>
      {children}
      {text && (
        <Span
          css={{
            '&, & a': {
              color: 'var(--theme-token-ens-name-text-color);',
            },
            '& a:hover': {
              textDecoration: 'none',
            },
          }}
          alignItems="center"
          columnGap={2}
          fontSize="15px"
          lineHeight="1.2"
        >
          {text}
        </Span>
      )}
    </Flex>
  )
}

export default WrapperComponent
