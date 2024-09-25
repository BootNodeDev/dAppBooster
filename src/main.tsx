import { StrictMode } from 'react'

import { RouterProvider, createRouter } from '@tanstack/react-router'
import ReactDOM from 'react-dom/client'

import NotFound404 from '@/src/components/pageComponents/NotFound404'
import { routeTree } from '@/src/routeTree.gen'

const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => <NotFound404 />,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const rootElement = document.getElementById('root')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)

  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
