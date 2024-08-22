import { ModalProvider, ModalContainer } from '@faceless-ui/modal'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { Wrapper, Main } from 'db-ui-toolkit'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'

import { Footer } from '@/src/components/sharedComponents/Footer'
import { Header } from '@/src/components/sharedComponents/Header'
import { TanStackReactQueryDevtools } from '@/src/components/sharedComponents/TanStackReactQueryDevtools'
import { TanStackRouterDevtools } from '@/src/components/sharedComponents/TanStackRouterDevtools'
import { Web3Provider } from '@/src/providers/Web3Provider'
import Styles from '@/src/styles'

import 'modern-normalize/modern-normalize.css'

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  return (
    <ThemeProvider defaultTheme={'light'}>
      <Styles />
      <Web3Provider>
        <ModalProvider>
          <Wrapper>
            <Header />
            <Main>
              <Outlet />
            </Main>
            <Footer />
            <TanStackReactQueryDevtools />
            <TanStackRouterDevtools />
          </Wrapper>
          <ModalContainer />
        </ModalProvider>
      </Web3Provider>
      <Toaster />
      <Analytics />
    </ThemeProvider>
  )
}
