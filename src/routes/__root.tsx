import { Main, Wrapper } from '@bootnodedev/db-ui-toolkit'
import { ModalContainer, ModalProvider } from '@faceless-ui/modal'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'

import { TanStackReactQueryDevtools } from '@/src/components/sharedComponents/TanStackReactQueryDevtools'
import { TanStackRouterDevtools } from '@/src/components/sharedComponents/TanStackRouterDevtools'
import { Footer } from '@/src/components/sharedComponents/ui/Footer'
import { Header } from '@/src/components/sharedComponents/ui/Header'
import { Provider } from '@/src/components/ui/provider'
import { TransactionNotificationProvider } from '@/src/lib/toast/TransactionNotificationProvider'
import { Web3Provider } from '@/src/providers/Web3Provider'
import Styles from '@/src/styles'

import { Flex } from '@chakra-ui/react'

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  return (
    // Remove ThemeProvider later
    <ThemeProvider defaultTheme={'light'}>
      <Provider>
        <Styles />
        <Web3Provider>
          {/*  remove ModalProvider later */}
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
              {/* Should remove Toaster later too */}
              <Toaster />
            </TransactionNotificationProvider>
            {/* Remove ModalContainer later  */}
            <ModalContainer />
          </ModalProvider>
        </Web3Provider>
        <Analytics />
      </Provider>
    </ThemeProvider>
  )
}
