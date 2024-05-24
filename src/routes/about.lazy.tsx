import { createLazyFileRoute } from '@tanstack/react-router'

import { About } from '@/src/pageComponents/about'

export const Route = createLazyFileRoute('/about')({
  component: About,
})
