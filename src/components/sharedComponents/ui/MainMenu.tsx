import { menuItems } from '@/src/constants/menuItems'
import { Flex, Link, chakra } from '@chakra-ui/react'
import { Link as ViteLink } from '@tanstack/react-router'

const sharedMenuItemStyles = {
  color: 'var(--theme-main-menu-item-color)',
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: '1.2',
  textDecoration: 'none',
  _hover: {
    textDecoration: 'underline',
  },
  _active: {
    opacity: 0.7,
  },
}

const Item = chakra(ViteLink)

export const MainMenu = ({ ...restProps }) => {
  return (
    <Flex
      align="center"
      display={{ base: 'none', xl: 'flex' }}
      flex="1"
      gap={10}
      height="100%"
      justifyContent="center"
      {...restProps}
    >
      {menuItems.map(({ href, label, to }, index) => {
        const key = `menuItem_${index}`

        return to ? (
          <Item
            css={sharedMenuItemStyles}
            key={key}
            to={to}
          >
            {label}
          </Item>
        ) : href ? (
          <Link
            css={sharedMenuItemStyles}
            href={href}
            key={key}
            rel="noopener noreferrer"
            target="_blank"
          >
            {label}
          </Link>
        ) : null
      })}
    </Flex>
  )
}

export default MainMenu
