import { Suspense, lazy } from 'react'

const ReactQueryDevtools = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import('@tanstack/react-query-devtools').then((res) => ({
        default: res.ReactQueryDevtools,
      })),
    )

export const TanStackReactQueryDevtools = () => (
  <Suspense>
    <ReactQueryDevtools />
  </Suspense>
)
