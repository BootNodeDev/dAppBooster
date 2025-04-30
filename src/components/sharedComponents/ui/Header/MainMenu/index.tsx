import { menuItems } from '@/src/constants/menuItems'
import { Flex, type FlexProps, Link, chakra } from '@chakra-ui/react'
import { Link as ViteLink } from '@tanstack/react-router'
import type { FC } from 'react'
import styles from './styles'

const sharedMenuItemStyles = {
  color: 'var(--color)',
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

export const MainMenu: FC<FlexProps> = ({ css, ...restProps }) => {
  return (
    <Flex
      align="center"
      css={{
        ...css,
        ...styles,
      }}
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
