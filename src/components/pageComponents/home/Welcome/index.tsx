import { DarkClouds, LightClouds } from '@/src/components/pageComponents/home/Welcome/Clouds'
import DocsButton from '@/src/components/pageComponents/home/Welcome/DocsButton'
import Ghost from '@/src/components/pageComponents/home/Welcome/Ghost'
import GitClone from '@/src/components/pageComponents/home/Welcome/GitClone'
import GithubButton from '@/src/components/pageComponents/home/Welcome/GithubButton'
import { Inner } from '@/src/components/sharedComponents/ui/Inner'
import { Box, Flex, Heading, Text } from '@chakra-ui/react'
import type { FC, HTMLAttributes } from 'react'

const Welcome: FC<HTMLAttributes<HTMLElement>> = ({ ...restProps }) => {
  return (
    <Flex
      css={{
        '.light &': {
          '--landing-page-main-background-color': '#f7f7f7',
        },
        '.dark &': {
          '--landing-page-main-background-color': '#2e3048',
        },
      }}
      flexDirection="column"
      minHeight={{ base: 'none', md: '100vh' }}
      position="relative"
      zIndex={0}
      {...restProps}
    >
      <Flex
        justifyContent="center"
        overflow="hidden"
        position="relative"
        width="100%"
        _before={{
          content: "''",
          backgroundColor: 'var(--landing-page-main-background-color)',
          display: 'block',
          flexGrow: 1,
          flexShrink: 1,
          minWidth: 0,
        }}
        _after={{
          content: "''",
          backgroundColor: 'var(--landing-page-main-background-color)',
          display: 'block',
          flexGrow: 1,
          flexShrink: 1,
          minWidth: 0,
        }}
      >
        <LightClouds alt="dAppBooster dark clouds" />
        <DarkClouds alt="dAppBooster dark clouds" />
        <Ghost alt="The dAppBooster ghost icon" />
      </Flex>
      <Box
        backgroundColor="var(--landing-page-main-background-color)"
        flexGrow={1}
      >
        <Inner
          alignItems="center"
          flexDirection="column"
        >
          <Heading
            fontSize={{ base: '32px', md: '48px' }}
            fontWeight="800"
            lineHeight="1.2"
            mb={2}
            pt={{ base: 8, md: 0 }}
            textAlign="center"
          >
            Boost dApp
            <br />
            development on the
            <br /> blockchain
          </Heading>
          <Text
            color="{colors.text.default}"
            fontSize={{ base: '16px', md: '18px' }}
            lineHeight="1.5"
            marginBottom={8}
            textAlign="center"
          >
            A modern blockchain boilerplate built to quickly get
            <Box
              as="br"
              display={{ base: 'none', md: 'block' }}
            />
            you started with your next Web3 project.
          </Text>
          <Flex
            display="flex"
            gap={2}
            justifyContent="center"
            marginBottom={8}
          >
            <GithubButton />
            <DocsButton />
          </Flex>
          <GitClone />
        </Inner>
      </Box>
    </Flex>
  )
}

export default Welcome
