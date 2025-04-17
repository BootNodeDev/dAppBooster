import Examples from '@/src/components/pageComponents/home/Examples'
import Welcome from '@/src/components/pageComponents/home/Welcome'
import { Flex } from '@chakra-ui/react'

export const Home = ({ ...restProps }) => {
  return (
    <Flex
      direction="column"
      flexGrow={1}
      mt="calc(var(--base-header-height) * -1)"
      position="relative"
      w="100%"
      {...restProps}
    >
      <Welcome />
      <Examples />
    </Flex>
  )
}
