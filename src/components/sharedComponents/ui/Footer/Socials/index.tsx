import Github from '@/src/components/sharedComponents/ui/Footer/Socials/assets/Github'
import LinkedIn from '@/src/components/sharedComponents/ui/Footer/Socials/assets/LinkedIn'
import Telegram from '@/src/components/sharedComponents/ui/Footer/Socials/assets/Telegram'
import Twitter from '@/src/components/sharedComponents/ui/Footer/Socials/assets/Twitter'
import { Flex, type FlexProps, Link } from '@chakra-ui/react'
import type { FC } from 'react'

const Socials: FC<FlexProps> = ({ ...restProps }) => {
  const items = [
    { label: 'Telegram', icon: <Telegram />, href: 'https://t.me/dAppBooster' },
    { label: 'Github', icon: <Github />, href: 'https://github.com/BootNodeDev' },
    { label: 'Twitter', icon: <Twitter />, href: 'https://twitter.com/bootnodedev' },
    {
      label: 'LinkedIn',
      icon: <LinkedIn />,
      href: 'https://www.linkedin.com/company/bootnode-dev/',
    },
  ]

  return (
    <Flex
      alignItems="center"
      gap={4}
      display="flex"
      justifyContent="center"
      {...restProps}
    >
      {items.map(({ href, icon, label }) => (
        <Link
          _active={{
            opacity: 0.8,
          }}
          color="inherit"
          display="block"
          href={href}
          key={`${href}`}
          rel="noreferrer"
          target="_blank"
          textDecoration="none"
          title={label}
        >
          {icon}
        </Link>
      ))}
    </Flex>
  )
}

export default Socials
