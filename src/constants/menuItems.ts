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
    label: 'Documentation',
    href: 'https://bootnodedev.github.io/dAppBooster/',
  },
  {
    label: 'Examples',
    to: '/#examples',
  },
]
