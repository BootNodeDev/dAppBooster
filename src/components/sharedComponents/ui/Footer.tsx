import { Inner } from '@/src/components/ui/Inner'
import { LogoMini } from '@bootnodedev/db-ui-toolkit'
import { Flex } from '@chakra-ui/react'
import type { FC } from 'react'

export const Footer: FC = ({ ...restProps }) => {
  return (
    <Flex
      alignItems="center"
      as="footer"
      backgroundColor="var(--theme-footer-background-color)"
      color="var(--theme-footer-text-color)"
      display="flex"
      flexGrow={0}
      flexShrink={0}
      height="92px"
      justifyContent="center"
      mt={8}
      {...restProps}
    >
      <Inner>
        <a
          href="https://www.bootnode.dev/"
          rel="noreferrer"
          target="_blank"
          title="Building the future of Web3"
        >
          <LogoMini />
        </a>
      </Inner>
    </Flex>
  )
}
