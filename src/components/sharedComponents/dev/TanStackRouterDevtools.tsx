import { Suspense, lazy } from 'react'

const RouterDevtoolsBase = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import('@tanstack/router-devtools').then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    )

export const TanStackRouterDevtools = () => (
  <Suspense>
    <RouterDevtoolsBase />
  </Suspense>
)
