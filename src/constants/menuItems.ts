type MenuItem = {
  href?: string
  label: string
  to?: string
}

export const menuItems = [
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
] as MenuItem[]
