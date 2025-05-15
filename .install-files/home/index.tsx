import { Card, Code, Flex, Heading, List, Span } from '@chakra-ui/react'

export const Home = () => (
  <Flex
    alignItems="center"
    flexGrow={1}
    justifyContent="center"
  >
    <Card.Root
      maxWidth={'100%'}
      size={'lg'}
      width={'600px'}
    >
      <Card.Header
        display={'flex'}
        justifyContent={'space-between'}
        flexDirection={'row'}
      >
        <Heading>
          Welcome to{' '}
          <a
            href="https://dappbooster.dev"
            rel="noreferrer"
            target="_blank"
          >
            dAppBooster
          </a>
          !
        </Heading>
        <Span marginLeft={'auto'}>👻</Span>
      </Card.Header>
      <Card.Body
        gap={3}
        minHeight={'300px'}
      >
        <List.Root paddingLeft={5}>
          <List.Item>
            You can modify this content by editing{' '}
            <Code>src/components/pageComponents/home/index.tsx</Code>
          </List.Item>
          <List.Item>
            Examples of usage of all the components can be found{' '}
            <a
              href={'https://bootnodedev.github.io/dAppBooster/'}
              target={'_blank'}
              rel="noreferrer"
            >
              here
            </a>
            .
          </List.Item>
          <List.Item>
            Don't forget to check{' '}
            <a
              href={'https://docs.dappbooster.dev/'}
              target={'_blank'}
              rel="noreferrer"
            >
              the documentation
            </a>
            !
          </List.Item>
        </List.Root>
      </Card.Body>
    </Card.Root>
  </Flex>
)

export default Home
