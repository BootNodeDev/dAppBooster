'use client'

import { useState } from 'react'
import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { WagmiProvider } from 'wagmi'

import ErrorBoundary from '@/app/_components/ErrorBoundary'
import Web3Provider from '@/app/_components/Web3Provider'
export default function AppDefaultInits({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ErrorBoundary>
      <Web3Provider>{children}</Web3Provider>
    </ErrorBoundary>
  )
}
