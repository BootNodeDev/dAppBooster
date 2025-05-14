import { LogoMini } from '@/src/components/sharedComponents/ui/Footer/LogoMini'
import Socials from '@/src/components/sharedComponents/ui/Footer/Socials'
import { Inner } from '@/src/components/sharedComponents/ui/Inner'
import { Box, Flex, type FlexProps } from '@chakra-ui/react'
import packageJSON from '@packageJSON'
import type { FC } from 'react'
import styles from './styles'

export const Footer: FC<FlexProps> = ({ css, ...restProps }) => {
  return (
    <Flex
      alignItems="center"
      as="footer"
      backgroundColor="var(--background-color)"
      color="var(--text-color)"
      css={{ ...css, ...styles }}
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
        columnGap={4}
        justify="space-between"
        width="100%"
      >
        <Flex
          align="center"
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
            backgroundColor="var(--line-color)"
            height="17px"
            width="1px"
          />
          <Socials />
        </Flex>
        <Box
          fontSize="12px"
          lineHeight="1.2"
        >
          Version: {packageJSON.version}
        </Box>
      </Inner>
    </Flex>
  )
}
