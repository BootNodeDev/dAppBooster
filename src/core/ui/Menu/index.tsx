import { Menu, type MenuContentProps, type MenuItemProps } from '@chakra-ui/react'
import type { FC } from 'react'
import styles from './styles'

export const MenuContent: FC<MenuContentProps> = ({ children, css, ...restProps }) => (
  <Menu.Content
    backgroundColor="var(--background-color)"
    borderColor="var(--border-color)"
    boxShadow="var(--box-shadow)"
    css={{ ...css, ...styles }}
    padding="0"
    display="flex"
    alignItems="stretch"
    {...restProps}
  >
    {children}
  </Menu.Content>
)

export const MenuItem: FC<MenuItemProps> = ({ children, css, ...restProps }) => (
  <Menu.Item
    alignItems="center"
    backgroundColor="var(--item-background-color)"
    borderBottom="1px solid var(--item-border-color)"
    color="var(--item-color)"
    columnGap={2}
    cursor="pointer"
    fontSize="16px"
    fontWeight="400"
    justifyContent="flex-start"
    lineHeight="1.4"
    minHeight="48px"
    overflow="hidden"
    paddingX={4}
    transition="background-color {durations.fast} ease-in-out"
    _hover={{
      backgroundColor: 'var(--item-background-color-hover)',
      color: 'var(--item-color-hover)',
      borderBottom: '1px solid var( --item-border-color-hover)',
    }}
    _active={{
      backgroundColor: 'var(--item-background-color-active)',
      color: 'var(--item-color-active)',
      borderBottom: '1px solid var( --item-border-color-active)',
    }}
    {...restProps}
  >
    {children}
  </Menu.Item>
)
