import { createFileRoute } from '@tanstack/react-router'

import { Home } from '@/src/components/pageComponents/home'

export const Route = createFileRoute('/')({
  component: Home,
})
