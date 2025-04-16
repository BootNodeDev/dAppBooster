import {
  Code as BaseCode,
  List as BaseList,
  Card,
  type CodeProps,
  Heading,
  type ListRootProps,
} from '@chakra-ui/react'
import type { FC } from 'react'

/**
 * Home page example
 *
 * You can safely delete the contents of this file and start from scratch,
 * just make sure to keep the file itself and export a component named Home.
 */
const List: FC<ListRootProps> = ({ ...restProps }) => (
  <BaseList.Root
    display="flex"
    flexDirection="column"
    fontSize="15px"
    listStyleType="circle"
    paddingLeft={6}
    rowGap={4}
    {...restProps}
  />
)

const NestedList: FC<ListRootProps> = ({ ...restProps }) => (
  <List
    paddingBottom={4}
    paddingTop={4}
    rowGap={2}
    {...restProps}
  />
)

/**
 * A styled pre tag
 */
const Code: FC<CodeProps> = ({ ...restProps }) => (
  <BaseCode
    as="pre"
    bg="var(--theme-body-background-color)"
    borderRadius="5px"
    color="var(--theme-text-color)"
    display="block"
    fontSize="13px"
    lineHeight={1.5}
    m="var(--base-gap) 0 0"
    p="4px 10px"
    whiteSpace="normal"
    wordBreak="break-all"
    {...restProps}
  />
)

export const Home = () => {
  return (
    // You can safely delete this.
    <Card.Root
      fontSize="15px"
      margin="auto"
      maxWidth="90%"
      backgroundColor="var(--theme-card-background-color)"
      borderColor="var(--theme-card-border-color)"
      boxShadow="var(--theme-card-box-shadow)"
      borderRadius="md"
      display="flex"
      flexDirection="column"
      padding={4}
      whiteSpace="normal"
    >
      <Heading
        as="h1"
        color="var(--theme-color-title)"
        fontSize="var(--base-title-font-size)"
        fontFamily={'var(--base-font-family)'}
        fontWeight="700"
        lineHeight="1.2"
        marginBottom={6}
      >
        Getting started
      </Heading>
      <List>
        <BaseList.Item>
          <a
            href="https://dappbooster.dev"
            rel="noreferrer"
            target="_blank"
          >
            dAppBooster demo
          </a>
          : a fully functional dAppBooster dApp with plenty of examples and{' '}
          <a
            href="https://docs.dappbooster.dev/"
            target="_blank"
            rel="noreferrer"
          >
            documentation
          </a>
          .
        </BaseList.Item>
        <BaseList.Item>
          <a
            href="https://github.com/BootNodeDev/dAppBoosterLandingPage/tree/main/src/components/pageComponents/home/Examples/demos"
            rel="noreferrer"
            target="_blank"
          >
            Demo's source code on GitHub
          </a>
        </BaseList.Item>
        <BaseList.Item>
          <a
            href="https://bootnodedev.github.io/dAppBooster/"
            rel="noreferrer"
            target="_blank"
          >
            Components technical documentation
          </a>
        </BaseList.Item>
        <BaseList.Item>
          <b>Where to start?</b>
          <NestedList>
            <BaseList.Item>
              Home page <Code>src/components/pageComponents/home/index.tsx</Code>
            </BaseList.Item>
            <BaseList.Item>
              Header <Code>src/components/sharedComponents/Header.tsx</Code>
            </BaseList.Item>
            <BaseList.Item>
              Footer <Code>src/components/sharedComponents/Footer/index.tsx</Code>
            </BaseList.Item>
            <BaseList.Item>
              App layout <Code>src/routes/__root.tsx</Code>
            </BaseList.Item>
            <BaseList.Item>
              Home route <Code>src/routes/index.lazy.tsx</Code>
            </BaseList.Item>
          </NestedList>
        </BaseList.Item>
      </List>
    </Card.Root>
  )
}
