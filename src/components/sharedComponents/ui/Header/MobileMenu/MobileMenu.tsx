import Logo from '@/src/components/sharedComponents/ui/Header/Logo'
import MainMenu from '@/src/components/sharedComponents/ui/Header/MainMenu'
import { SwitchThemeButton } from '@/src/components/sharedComponents/ui/SwitchThemeButton'
import { ConnectWalletButton } from '@/src/providers/Web3Provider'
import { chakra } from '@chakra-ui/react'
import { Drawer } from '@chakra-ui/react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import styles from './styles'

const MenuIcon = () => (
  <svg
    fill="none"
    height="15"
    viewBox="0 0 18 15"
    width="18"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Menu Icon</title>
    <path
      d="M18 7.41614C18 7.61505 17.921 7.80582 17.7803 7.94647C17.6397 8.08712 17.4489 8.16614 17.25 8.16614H0.75C0.551088 8.16614 0.360322 8.08712 0.21967 7.94647C0.0790178 7.80582 0 7.61505 0 7.41614C0 7.21723 0.0790178 7.02646 0.21967 6.88581C0.360322 6.74516 0.551088 6.66614 0.75 6.66614H17.25C17.4489 6.66614 17.6397 6.74516 17.7803 6.88581C17.921 7.02646 18 7.21723 18 7.41614ZM0.75 2.16614H17.25C17.4489 2.16614 17.6397 2.08712 17.7803 1.94647C17.921 1.80582 18 1.61505 18 1.41614C18 1.21723 17.921 1.02646 17.7803 0.885808C17.6397 0.745155 17.4489 0.666138 17.25 0.666138H0.75C0.551088 0.666138 0.360322 0.745155 0.21967 0.885808C0.0790178 1.02646 0 1.21723 0 1.41614C0 1.61505 0.0790178 1.80582 0.21967 1.94647C0.360322 2.08712 0.551088 2.16614 0.75 2.16614ZM17.25 12.6661H0.75C0.551088 12.6661 0.360322 12.7452 0.21967 12.8858C0.0790178 13.0265 0 13.2172 0 13.4161C0 13.6151 0.0790178 13.8058 0.21967 13.9465C0.360322 14.0871 0.551088 14.1661 0.75 14.1661H17.25C17.4489 14.1661 17.6397 14.0871 17.7803 13.9465C17.921 13.8058 18 13.6151 18 13.4161C18 13.2172 17.921 13.0265 17.7803 12.8858C17.6397 12.7452 17.4489 12.6661 17.25 12.6661Z"
      fill="currentColor"
    />
  </svg>
)

const CloseIcon = () => (
  <svg
    fill="none"
    height="17"
    viewBox="0 0 17 17"
    width="17"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Menu Icon</title>
    <path
      d="M16.4794 14.8955C16.5538 14.9698 16.6127 15.058 16.6529 15.1551C16.6932 15.2522 16.7139 15.3563 16.7139 15.4614C16.7139 15.5665 16.6932 15.6706 16.6529 15.7677C16.6127 15.8648 16.5538 15.9531 16.4794 16.0274C16.4051 16.1017 16.3169 16.1607 16.2198 16.2009C16.1227 16.2411 16.0186 16.2618 15.9135 16.2618C15.8084 16.2618 15.7043 16.2411 15.6072 16.2009C15.5101 16.1607 15.4218 16.1017 15.3475 16.0274L8.71387 9.39278L2.08024 16.0274C1.93013 16.1775 1.72655 16.2618 1.51427 16.2618C1.30199 16.2618 1.0984 16.1775 0.948299 16.0274C0.798195 15.8773 0.713867 15.6737 0.713867 15.4614C0.713867 15.2492 0.798195 15.0456 0.948299 14.8955L7.58293 8.26184L0.948299 1.62821C0.798195 1.47811 0.713867 1.27452 0.713867 1.06224C0.713867 0.849962 0.798195 0.646377 0.948299 0.496273C1.0984 0.346168 1.30199 0.261841 1.51427 0.261841C1.72655 0.261841 1.93013 0.346168 2.08024 0.496273L8.71387 7.1309L15.3475 0.496273C15.4976 0.346168 15.7012 0.261841 15.9135 0.261841C16.1257 0.261841 16.3293 0.346168 16.4794 0.496273C16.6295 0.646377 16.7139 0.849962 16.7139 1.06224C16.7139 1.27452 16.6295 1.47811 16.4794 1.62821L9.8448 8.26184L16.4794 14.8955Z"
      fill="currentColor"
    />
  </svg>
)

const Button = chakra(
  'button',
  {
    base: {
      alignItems: 'center',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      height: '30px',
      justifyContent: 'center',
      padding: '0',
      width: '30px',

      '&:active': {
        opacity: '0.7',
      },
    },
  },
  {
    defaultProps: {
      children: <MenuIcon />,
      type: 'button',
    },
  },
)

export const MobileMenu = () => {
  const { setTheme, theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(e) => setIsOpen(e.open)}
    >
      <Drawer.Backdrop />
      <Drawer.Trigger asChild>
        <Button
          aria-label="Open menu"
          display={{ xl: 'none' }}
          margin="0 0 0 auto"
        />
      </Drawer.Trigger>
      <Drawer.Positioner>
        <Drawer.Content
          alignItems="center"
          backgroundColor="var(--background-color)"
          color="var(--color)"
          css={{ ...styles }}
          display="flex"
          flexDirection="column"
          padding={3}
        >
          <Drawer.Header
            alignItems="center"
            display="flex"
            justifyContent="space-between"
            marginBottom={10}
            padding={0}
            width="100%"
          >
            <Logo
              alt="dAppBooster - A blockchain boilerplate to kickstart your next Web3 project"
              width="140px"
            />
            <Drawer.CloseTrigger asChild>
              <Button aria-label="Close menu">
                <CloseIcon />
              </Button>
            </Drawer.CloseTrigger>
          </Drawer.Header>
          <Drawer.Body
            alignItems="center"
            display="flex"
            flexDirection="column"
            rowGap={6}
          >
            <ConnectWalletButton
              marginBottom={10}
              maxWidth="fit-content"
            />
            <MainMenu />
            <SwitchThemeButton
              marginTop="auto"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            />
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  )
}

export default MobileMenu
