import { Wrapper, Main } from '@bootnodedev/db-ui-toolkit'
import { ModalProvider, ModalContainer } from '@faceless-ui/modal'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'

import { TanStackReactQueryDevtools } from '@/src/components/sharedComponents/TanStackReactQueryDevtools'
import { TanStackRouterDevtools } from '@/src/components/sharedComponents/TanStackRouterDevtools'
import { Footer } from '@/src/components/sharedComponents/ui/Footer'
import { Header } from '@/src/components/sharedComponents/ui/Header'
import { TransactionNotificationProvider } from '@/src/lib/toast/TransactionNotificationProvider'
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
          <TransactionNotificationProvider>
            <Wrapper>
              <Header />
              <Main>
                <Outlet />
              </Main>
              <Footer />
              <TanStackReactQueryDevtools />
              <TanStackRouterDevtools />
            </Wrapper>
            <Toaster />
          </TransactionNotificationProvider>
          <ModalContainer />
        </ModalProvider>
      </Web3Provider>
      <Analytics />
    </ThemeProvider>
  )
}
