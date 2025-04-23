import { TanStackReactQueryDevtools } from '@/src/components/sharedComponents/TanStackReactQueryDevtools'
import { TanStackRouterDevtools } from '@/src/components/sharedComponents/TanStackRouterDevtools'
import { Footer } from '@/src/components/sharedComponents/ui/Footer'
import { Header } from '@/src/components/sharedComponents/ui/Header'
import { Provider } from '@/src/components/ui/provider'
import { TransactionNotificationProvider } from '@/src/lib/toast/TransactionNotificationProvider'
import { Web3Provider } from '@/src/providers/Web3Provider'
import Styles from '@/src/styles'
import { Flex } from '@chakra-ui/react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'

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
          <TransactionNotificationProvider>
            <Flex
              direction="column"
              minH="100vh"
              w="100%"
            >
              <Header />
              <Flex
                as="main"
                flex="1"
              >
                <Outlet />
              </Flex>
              <Footer />
              <TanStackReactQueryDevtools />
              <TanStackRouterDevtools />
            </Flex>
            {/* Should remove Toaster later too */}
            <Toaster />
          </TransactionNotificationProvider>
        </Web3Provider>
        <Analytics />
      </Provider>
    </ThemeProvider>
  )
}
