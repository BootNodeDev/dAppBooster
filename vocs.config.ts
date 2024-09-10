import { defineConfig } from 'vocs'

export default defineConfig({
  description:
    'Build reliable apps & libraries with lightweight, \
    composable, and type-safe modules that interface with Ethereum.',
  title: 'dappBooster',
  sidebar: [
    {
      text: 'Introduction',
      link: '/',
      items: [
        {
          text: 'Why dAppBooster',
          link: '/introduction/why-dappBooster',
        },
        {
          text: 'Getting started',
          link: '/introduction/getting-started',
        },
        {
          text: 'Stack',
          link: '/introduction/stack',
        },
      ],
    },
    {
      text: 'Components',
      collapsed: true,
      items: [
        { text: 'Transaction Button', link: '/components/transaction-button' },
        { text: 'Token Input', link: '/components/token-input' },
      ],
    },
    {
      text: 'Guides',
      collapsed: true,
      items: [
        {
          text: 'My First dapp',
          link: '/guides/my-first-dapp',
        },
        {
          text: 'Subgraphs',
          link: '/guides/subgraphs',
        },
      ],
    },
    {
      text: 'Styling',
      collapsed: true,
      items: [
        {
          text: 'Basic Styling',
          link: '/guides/basic-styling',
        },
      ],
    },
  ],
})
