import { defineConfig } from 'vocs'

export default defineConfig({
  description:
    'Build reliable apps & libraries with lightweight, \
    composable, and type-safe modules that interface with Ethereum.',
  title: 'dappBooster',
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
  ],
})
