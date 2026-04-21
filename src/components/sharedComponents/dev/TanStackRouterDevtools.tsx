import { lazy, Suspense } from 'react'

const RouterDevtoolsBase = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import('@tanstack/react-router-devtools').then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    )

export const TanStackRouterDevtools = () => (
  <Suspense>
    <RouterDevtoolsBase />
  </Suspense>
)
