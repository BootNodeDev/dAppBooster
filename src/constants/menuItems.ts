type MenuItem = {
  href?: string
  label: string
  to?: string
}

/**
 * A collection of menu items to be displayed in the header.
 */
export const menuItems: MenuItem[] = [
  {
    label: 'Home',
    to: '/#top',
  },
  {
    label: 'Documentation',
    href: 'https://docs.dappboster.io',
  },
  {
    label: 'Examples',
    to: '/#examples',
  },
]
