import Badge from '@/src/components/pageComponents/home/Examples/Item/Badge'
import DocumentationButton from '@/src/components/pageComponents/home/Examples/Item/DocumentationButton'
import SourceCodeButton from '@/src/components/pageComponents/home/Examples/Item/SourceCodeButton'
import { Flex, type FlexProps, Heading, Text } from '@chakra-ui/react'
import type { FC, ReactNode } from 'react'
import styles from '../Item/styles'

export interface Props extends FlexProps {
  demo: ReactNode
  href?: string
  icon: ReactNode
  sourceCodeHref?: string
  text: string | ReactNode
  title: string
}

const Item: FC<Props> = ({ css, demo, href, icon, sourceCodeHref, text, title, ...restProps }) => {
  return (
    <Flex
      backgroundColor="var(--background-color)"
      border="1px solid var(--border-color)"
      borderRadius="8px"
      display="flex"
      flexDirection="column"
      minHeight="288px"
      minWidth="0"
      maxWidth="100%"
      padding={6}
      css={{
        ...styles,
        ...css,
      }}
      {...restProps}
    >
      <Flex
        css={{
          '--icon-size': '48px',
        }}
        alignItems="center"
        border="1px solid var(--icon-border-color)"
        borderRadius="50%"
        color="#C670E5"
        display="flex"
        height="var(--icon-size)"
        justifyContent="center"
        marginBottom={4}
        width="var(--icon-size)"
      >
        {icon}
      </Flex>
      <Heading
        as="h3"
        color="var(--title-color)"
        fontSize="18px"
        fontWeight={700}
        lineHeight="1.5"
        margin={1}
      >
        {title}
      </Heading>
      <Text
        css={{
          '& a': {
            color: 'var(--text-color)',
            textDecoration: 'underline',
            '&:hover': {
              textDecoration: 'none',
            },
          },
        }}
        color="var(--text-color)"
        fontSize="16px"
        fontWeight={500}
        lineHeight="1.6"
        margin="0"
        opacity="0.6"
      >
        {text}
      </Text>
      <Flex
        marginTop="auto"
        columnGap={2}
        paddingTop={6}
      >
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
  )
}

export default Item
