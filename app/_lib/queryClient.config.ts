import { QueryClient } from '@tanstack/react-query'

export const queryClientConfig = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1,
    },
  },
})
