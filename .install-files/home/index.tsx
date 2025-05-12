import { Flex } from '@chakra-ui/react'

export const Home = () => (
  <Flex
    alignItems="center"
    flexGrow={1}
    justifyContent="center"
  >
    Welcome to{' '}
    <a
      href="https://dappbooster.dev"
      rel="noreferrer"
      target="_blank"
    >
      dAppBooster
    </a>
    !
  </Flex>
)

export default Home
