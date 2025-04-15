import type { FC, HTMLAttributes } from 'react'

import { ConnectWalletButton } from '@/src/providers/Web3Provider'
import { Logo as BaseLogo, SwitchThemeButton } from '@bootnodedev/db-ui-toolkit'
import { Box, Flex, chakra } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import { useTheme } from 'next-themes'

const HomeLink = chakra(Link)
const Logo = chakra(BaseLogo)

export const Header: FC<HTMLAttributes<HTMLElement>> = ({ ...restProps }) => {
  const { setTheme, theme } = useTheme()

  return (
    <Box
      as="header"
      flexGrow={0}
      flexShrink={0}
      h={{ lg: '90px' }}
      mb={4}
      position="relative"
      pt={4}
      zIndex={10}
      {...restProps}
    >
      <Flex
        align="center"
        justify="space-between"
        flexShrink={0}
        h="100%"
        mx="auto"
        maxW="100%"
        px={{ base: 1, md: 2, xl: 4 }}
        // Should use this when CSS variables are available
        //w="var(--base-container-max-width, 1360px)"
        w="1360px" // fallback for var
      >
        <Box flex={1}>
          <HomeLink
            to="/"
            display={{ base: 'none', md: 'flex' }}
            _active={{ opacity: 0.7 }}
          >
            <Logo minWidth="140px" />
          </HomeLink>
        </Box>
        <Flex
          align="center"
          flex={1}
          gap={2}
          h="100%"
          justify="flex-end"
        >
          <SwitchThemeButton onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
          <ConnectWalletButton />
        </Flex>
      </Flex>
    </Box>
  )
}
