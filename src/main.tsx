import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

// BigInt is not serializable by JSON.stringify. React 19 dev mode tries to serialize
// component props for dev tools logging, which crashes when props contain BigInt values
// (e.g., TransactionParams with value: parseEther('0.1')). This polyfill prevents the crash.
;(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString()
}

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
