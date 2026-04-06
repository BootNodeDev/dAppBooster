import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import NotFound404 from '@/src/components/pageComponents/NotFound404'
import { routeTree } from '@/src/routeTree.gen'
import { printAppInfo } from '@/src/utils/printAppInfo'

const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => <NotFound404 />,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

printAppInfo()

// biome-ignore lint/style/noNonNullAssertion: root element is guaranteed by index.html
const rootElement = document.getElementById('root')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)

  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
