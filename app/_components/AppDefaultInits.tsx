'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { WagmiProvider } from 'wagmi'

import ErrorBoundary from '@/app/_components/ErrorBoundary'
import { queryClientConfig } from '@/app/_lib/queryClient.config'
import { wagmiConfig } from '@/app/_lib/wagmi.config'

export default function AppDefaultInits({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
