// TODO(task-3): move to app shell — core/ should not import from wallet/

import { Box, type BoxProps, chakra, Flex } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import { useTheme } from 'next-themes'
import type { FC } from 'react'
import { ConnectWalletButton } from '@/src/wallet/providers'
import { Inner } from '../Inner'
import { SwitchThemeButton } from '../SwitchThemeButton'
import Logo from './Logo'
import MainMenu from './MainMenu'
import MobileMenu from './MobileMenu/MobileMenu'
import styles from './styles'

const HomeLink = chakra(Link)

export const Header: FC<BoxProps> = ({ css, ...restProps }) => {
  const { setTheme, theme } = useTheme()

  return (
    <Box
      as="header"
      color="var(--text-color)"
      css={{ ...css, ...styles }}
      flexGrow={0}
      flexShrink={0}
      h="90px"
      position="relative"
      pt={4}
      zIndex={10}
      {...restProps}
    >
      <Inner
        align="center"
        h="100%"
        justify="space-between"
        width="100%"
      >
        <Box flex={1}>
          <HomeLink
            _active={{ opacity: 0.7 }}
            to="/"
          >
            <Logo width={{ base: '120px', md: '140px' }} />
          </HomeLink>
        </Box>
        <MainMenu
          display={{ base: 'none', xl: 'flex' }}
          flex="1"
          height="100%"
        />
        <Flex
          align="center"
          display={{ base: 'none', xl: 'flex' }}
          flex={1}
          gap={6}
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
