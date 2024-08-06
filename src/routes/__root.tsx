import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { Wrapper, Main } from 'db-ui-toolkit'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'

import { Web3Provider } from '@/src/providers/Web3Provider'
import { Footer } from '@/src/sharedComponents/Footer'
import { Header } from '@/src/sharedComponents/Header'
import { TanStackReactQueryDevtools } from '@/src/sharedComponents/TanStackReactQueryDevtools'
import { TanStackRouterDevtools } from '@/src/sharedComponents/TanStackRouterDevtools'
import Styles from '@/src/styles'

import 'modern-normalize/modern-normalize.css'

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  return (
    <ThemeProvider defaultTheme={'light'}>
      <Styles />
      <Wrapper>
        <Web3Provider>
          <Header />
          <Main>
            <Outlet />
          </Main>
          <Footer />
          <TanStackReactQueryDevtools />
          <TanStackRouterDevtools />
        </Web3Provider>
      </Wrapper>
      <Toaster />
      <Analytics />
    </ThemeProvider>
  )
}
