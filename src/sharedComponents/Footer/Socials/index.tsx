import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import Github from '@/src/sharedComponents/Footer/Socials/assets/Github'
import LinkedIn from '@/src/sharedComponents/Footer/Socials/assets/LinkedIn'
import Telegram from '@/src/sharedComponents/Footer/Socials/assets/Telegram'
import Twitter from '@/src/sharedComponents/Footer/Socials/assets/Twitter'

const Wrapper = styled.div`
  align-items: center;
  column-gap: calc(var(--base-gap) * 2);
  display: flex;
  justify-content: center;
`

const Link = styled.a`
  color: inherit;
  display: block;
  text-decoration: none;

  &:active {
    opacity: 0.8;
  }
`

const Socials: React.FC<HTMLAttributes<HTMLDivElement>> = ({ ...restProps }) => {
  const items = [
    { label: 'Telegram', icon: <Telegram />, href: 'https://t.me/mgarciap' },
    { label: 'Github', icon: <Github />, href: 'https://github.com/BootNodeDev' },
    { label: 'Twitter', icon: <Twitter />, href: 'https://twitter.com/bootnodedev' },
    {
      label: 'LinkedIn',
      icon: <LinkedIn />,
      href: 'https://www.linkedin.com/company/bootnode-dev/',
    },
  ]

  return (
    <Wrapper {...restProps}>
      {items.map(({ href, icon, label }, index) => (
        <Link href={href} key={index} rel="noreferrer" target="_blank" title={label}>
          {icon}
        </Link>
      ))}
    </Wrapper>
  )
}

export default Socials
