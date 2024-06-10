import { createLazyFileRoute } from '@tanstack/react-router'

import { Tokens } from '@/src/pageComponents/tokens'

export const Route = createLazyFileRoute('/tokens')({
  component: Tokens,
})
