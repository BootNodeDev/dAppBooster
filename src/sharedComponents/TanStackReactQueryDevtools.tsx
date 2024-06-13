import React, { Suspense } from 'react'

const ReactQueryDevtools = import.meta.env.PROD
  ? () => null
  : React.lazy(() =>
      import('@tanstack/react-query-devtools').then((res) => ({
        default: res.ReactQueryDevtools,
      })),
    )

export const TanStackReactQueryDevtools = () => (
  <Suspense>
    <ReactQueryDevtools />
  </Suspense>
)
