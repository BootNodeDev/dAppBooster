import { type SidebarItem, defineConfig } from 'vocs'

export default defineConfig({
  title: 'dAppBooster',
  description:
    'A modern starter kit built with React to quickly get started with your next web3 project.',
  iconUrl: '/favicon.svg',
  logoUrl: '/logo.svg',
  topNav: [
    {
      text: 'dappbooster.dev',
      link: 'https://dappbooster.dev',
    },
    {
      text: 'demos',
      link: 'https://demo.dappbooster.dev',
    },
    {
      text: 'blog',
      link: 'https://blog.bootnode.dev/',
    },
  ],
  socials: [
    {
      icon: 'x',
      link: 'https://x.com/bootnodedev',
    },
    {
      icon: 'github',
      link: 'https://github.com/BootNodeDev/dAppBooster',
    },
    {
      icon: 'telegram',
      link: 'https://t.me/dAppBooster',
    },
  ],
  sidebar: [
    {
      items: [
        {
          text: 'Introduction',
          link: '/',
        },
        {
          text: 'Why dAppBooster',
          link: '/introduction/why-dappBooster',
        },
        {
          text: 'Getting started',
          link: '/introduction/getting-started',
        },
      ],
    },
    {
      text: 'Components',
      items: [
        {
          text: 'Introduction',
          link: '/components/introduction',
        },
      ],
    },
    {
      text: 'Recipes',
      items: [
        {
          text: 'My First dapp',
          link: '/recipes/my-first-dapp',
        },
        {
          text: 'Subgraphs',
          link: '/recipes/subgraphs',
        },
      ],
    },
    {
      text: 'Advanced',
      items: [
        {
          text: 'Subgraph plugin',
          link: '/advanced/subgraph-plugin',
        },
        {
          text: 'Networks',
          link: '/advanced/networks',
        },
        {
          text: 'Manual installation',
          link: '/advanced/manual-installation',
        },
        {
          text: 'Tech Stack',
          link: '/advanced/stack',
        },
      ],
    },
  ] as Array<SidebarItem>,
})
