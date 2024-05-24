import { createLazyFileRoute } from '@tanstack/react-router'

import { Contact } from '@/src/pageComponents/contact'

export const Route = createLazyFileRoute('/contact')({
  component: Contact,
})
