import { LogoMini } from '@/src/components/sharedComponents/ui/Footer/LogoMini'
import Socials from '@/src/components/sharedComponents/ui/Footer/Socials'
import { Inner } from '@/src/components/sharedComponents/ui/Inner'
import { Box, Flex } from '@chakra-ui/react'
import packageJSON from '@packageJSON'
import type { FC } from 'react'

export const Footer: FC = ({ ...restProps }) => {
  return (
    <Flex
      alignItems="center"
      as="footer"
      backgroundColor="var(--theme-footer-background-color)"
      color="var(--theme-footer-text-color)"
      direction="column"
      display="flex"
      flexGrow={0}
      flexShrink={0}
      height="92px"
      justifyContent="center"
      {...restProps}
    >
      <Inner
        align="center"
        justify="center"
        columnGap={4}
      >
        <a
          href="https://www.bootnode.dev/"
          rel="noreferrer"
          target="_blank"
          title="Building the future of Web3"
        >
          <LogoMini />
        </a>
        <Box
          css={{
            '.light &': {
              backgroundColor: '#c5c2cb',
            },
            '.dark &': {
              backgroundColor: '#5f6178',
            },
          }}
          height="17px"
          width="1px"
        />
        <Socials />
      </Inner>
      <Box
        fontSize="12px"
        lineHeight="1.2"
        mt={2}
      >
        Version: {packageJSON.version}
      </Box>
    </Flex>
  )
}
