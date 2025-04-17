import Badge from '@/src/components/pageComponents/home/Examples/Item/Badge'
import DocumentationButton from '@/src/components/pageComponents/home/Examples/Item/DocumentationButton'
import SourceCodeButton from '@/src/components/pageComponents/home/Examples/Item/SourceCodeButton'
import { Flex, Heading, Text } from '@chakra-ui/react'
import type { FC, HTMLAttributes, ReactNode } from 'react'

export interface Props extends HTMLAttributes<HTMLDivElement> {
  demo: ReactNode
  href?: string
  icon: ReactNode
  sourceCodeHref?: string
  text: string | ReactNode
  title: string
}

const Item: FC<Props> = ({ demo, href, icon, sourceCodeHref, text, title, ...restProps }) => {
  return (
    <Flex
      css={{
        "[data-theme='light'] &": {
          '--theme-examples-item-background-color': '#f7f7f7',
        },
        "[data-theme='dark'] &": {
          '--theme-examples-item-background-color': '#2e3048',
        },
      }}
      backgroundColor="var(--theme-examples-item-background-color)"
      borderRadius="var(--base-border-radius)"
      display="flex"
      flexDirection={{ base: 'column', lg: 'row' }}
      rowGap="20px"
      maxWidth="100%"
      paddingTop={{ base: 8, lg: 4 }}
      paddingBottom="16px"
      paddingRight="16px"
      paddingLeft={{ base: 4, lg: 8 }}
      columnGap={{ lg: 8 }}
      {...restProps}
    >
      <Flex
        alignItems={{ base: 'center', lg: 'flex-start' }}
        display="flex"
        flex="1"
        flexDirection="column"
        paddingBottom={{ lg: 0 }}
        paddingTop={{ lg: 4 }}
        rowGap="var(--base-gap-xl)"
      >
        <Flex
          css={{
            '--icon-size': '40px',
          }}
          alignItems="center"
          backgroundColor="var(--theme-color-primary)"
          borderRadius="50%"
          color="#fff"
          display="flex"
          height="var(--icon-size)"
          justifyContent="center"
          width="var(--icon-size)"
        >
          {icon}
        </Flex>
        <Heading
          as="h3"
          color="var(--theme-color-text-primary)"
          fontFamily={'var(--base-font-family)'}
          fontSize="24px"
          fontWeight={700}
          lineHeight="1.2"
          margin="0"
          textAlign={{ base: 'center', lg: 'left' }}
        >
          {title}
        </Heading>
        <Text
          css={{
            '& a': {
              color: 'var(--theme-color-text-primary)',
              textDecoration: 'underline',
              '&:hover': {
                textDecoration: 'none',
              },
            },
          }}
          color="var(--theme-color-text-primary)"
          fontSize="16px"
          fontWeight={500}
          lineHeight="1.5"
          margin="0"
          textAlign={{ base: 'center', lg: 'left' }}
        >
          {text}
        </Text>
        <Flex columnGap={2}>
          {href && (
            <DocumentationButton
              href={href}
              target="_blank"
            />
          )}
          {sourceCodeHref && (
            <SourceCodeButton
              as="a"
              href={sourceCodeHref}
              target="_blank"
            />
          )}
        </Flex>
      </Flex>
      <Flex
        alignItems="center"
        backgroundColor="var(--theme-examples-list-background-color)"
        borderRadius="var(--base-border-radius)"
        flex="1"
        flexDirection="column"
        justifyContent="center"
        minHeight={{ md: '205px' }}
        minWidth="0"
        paddingBottom={{ base: 6, md: 6 }}
        paddingLeft={6}
        paddingRight={6}
        paddingTop={{ base: 12, md: 8 }}
        position="relative"
      >
        <Badge />
        {demo}
      </Flex>
    </Flex>
  )
}

export default Item
