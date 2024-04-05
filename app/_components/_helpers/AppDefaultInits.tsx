'use client'

import { useState } from 'react'
import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { WagmiProvider } from 'wagmi'

import ErrorBoundary from '@/app/_components/_helpers/ErrorBoundary'
import { wagmiConfig } from '@/app/_lib/wagmi.config'

export default function AppDefaultInits({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [queryClientConfig] = useState(
    new QueryClient({
      defaultOptions: {
        queries: {
          // With SSR, we usually want to set some default staleTime
          // above 0 to avoid refetching immediately on the client
          staleTime: 60 * 1000,
        },
      },
    }),
  )
  return (
    <ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClientConfig}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  )
}
