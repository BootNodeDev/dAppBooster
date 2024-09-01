import { defineConfig } from 'vocs'

export default defineConfig({
  description:
    'Build reliable apps & libraries with lightweight, \
    composable, and type-safe modules that interface with Ethereum.',
  title: 'dappBooster',
  sidebar: [
    {
      text: 'Introduction',
      link: '/docs',
      items: [
        {
          text: 'Why dAppBooster',
          link: '/docs/introduction/why-dappBooster',
        },
        {
          text: 'Getting started',
          link: '/docs/introduction/getting-started',
        },
        {
          text: 'Stack',
          link: '/docs/introduction/stack',
        },
      ],
    },
    {
      text: 'Components',
      collapsed: true,
      items: [
        { text: 'Transaction Button', link: '/docs/components/transaction-button' },
        { text: 'Token Input', link: '/docs/components/token-input' },
      ],
    },
    {
      text: 'Guides',
      collapsed: true,
      items: [
        {
          text: 'Subgraphs',
          link: '/docs/guides/subgraphs',
        },
      ],
    },
  ],
})
