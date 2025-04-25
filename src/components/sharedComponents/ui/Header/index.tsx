import Logo from '@/src/components/sharedComponents/ui/Header/Logo'
import MainMenu from '@/src/components/sharedComponents/ui/Header/MainMenu'
import MobileMenu from '@/src/components/sharedComponents/ui/Header/MobileMenu'
import { Inner } from '@/src/components/sharedComponents/ui/Inner'
import { ConnectWalletButton } from '@/src/providers/Web3Provider'
import { SwitchThemeButton } from '@bootnodedev/db-ui-toolkit'
import { Box, Flex, chakra } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import { useTheme } from 'next-themes'
import type { FC, HTMLAttributes } from 'react'

const HomeLink = chakra(Link)

export const Header: FC<HTMLAttributes<HTMLElement>> = ({ ...restProps }) => {
  const { setTheme, theme } = useTheme()

  return (
    <Box
      as="header"
      color="var(--theme-header-text-color)"
      flexGrow={0}
      flexShrink={0}
      h={{ lg: '90px' }}
      mb={4}
      position="relative"
      pt={4}
      zIndex={10}
      {...restProps}
    >
      <Inner
        align="center"
        h="100%"
        justify="space-between"
      >
        <Box flex={1}>
          <HomeLink
            _active={{ opacity: 0.7 }}
            display={{ base: 'none', sm: 'flex' }}
            to="/"
          >
            <Logo minWidth="140px" />
          </HomeLink>
        </Box>
        <MainMenu />
        <Flex
          align="center"
          display={{ base: 'none', xl: 'flex' }}
          flex={1}
          gap={2}
          h="100%"
          justify="flex-end"
        >
          <SwitchThemeButton onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
          <ConnectWalletButton />
        </Flex>
        <MobileMenu />
      </Inner>
    </Box>
  )
}

export default Header
