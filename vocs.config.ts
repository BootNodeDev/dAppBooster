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
      items: [{ text: 'Introduction', link: '/components/introduction' }],
    },
    {
      text: 'Recipes',
      collapsed: true,
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
      text: 'Styling',
      collapsed: true,
      items: [
        {
          text: 'Basic Styling',
          link: '/styling/basic-styling',
        },
        {
          text: 'Integration with other libraries',
          link: '/styling/integration',
        },
      ],
    },
  ],
})
