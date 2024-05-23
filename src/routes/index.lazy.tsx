import { createLazyFileRoute } from '@tanstack/react-router'

import { Home } from '@/src/pageComponents/home'

export const Route = createLazyFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  return <Home />
}
