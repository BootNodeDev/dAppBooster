import { createLazyFileRoute } from '@tanstack/react-router'

import { Home } from '@/src/components/pageComponents/home'

export const Route = createLazyFileRoute('/')({
  component: Home,
})
