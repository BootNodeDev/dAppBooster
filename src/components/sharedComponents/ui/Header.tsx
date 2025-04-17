import MobileMenu from '@/src/components/sharedComponents/MobileMenu'
import MainMenu from '@/src/components/sharedComponents/ui/MainMenu'
import { Inner } from '@/src/components/ui/Inner'
import { ConnectWalletButton } from '@/src/providers/Web3Provider'
import { Logo as BaseLogo, SwitchThemeButton } from '@bootnodedev/db-ui-toolkit'
import { Box, Flex, chakra } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import { useTheme } from 'next-themes'
import type { FC, HTMLAttributes } from 'react'

const HomeLink = chakra(Link)
const Logo = chakra(BaseLogo)

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
            to="/"
            display={{ base: 'none', md: 'flex' }}
            _active={{ opacity: 0.7 }}
          >
            <Logo minWidth="140px" />
          </HomeLink>
        </Box>
        <MainMenu />
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
        <MobileMenu />
      </Inner>
    </Box>
  )
}
