import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/contact')({
  component: Contact,
})

function Contact() {
  return (
    <div>
      <h3>Hello from Contact!</h3>
    </div>
  )
}
