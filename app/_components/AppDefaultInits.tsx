'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { WagmiProvider } from 'wagmi'

import ErrorBoundary from '@/app/_components/ErrorBoundary'
import { queryClientConfig } from '@/app/_lib/queryClient.config'
import { wagmiConfig } from '@/app/_lib/wagmi.config'

export default function AppDefaultInits({
  aGreatProp,
  anotherProp,
  children,
  someOtherProp,
}: Readonly<{
  aGreatProp: string
  children: React.ReactNode
  someOtherProp: number
  anotherProp: boolean
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
