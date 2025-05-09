import { TanStackReactQueryDevtools } from '@/src/components/sharedComponents/dev/TanStackReactQueryDevtools'
import { TanStackRouterDevtools } from '@/src/components/sharedComponents/dev/TanStackRouterDevtools'
import { Footer } from '@/src/components/sharedComponents/ui/Footer'
import { Header } from '@/src/components/sharedComponents/ui/Header'
import { Provider } from '@/src/components/ui/provider'
import { Toaster } from '@/src/components/ui/toaster'
import { TransactionNotificationProvider } from '@/src/providers/TransactionNotificationProvider'
import { Web3Provider } from '@/src/providers/Web3Provider'
import { Flex } from '@chakra-ui/react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  return (
    <Provider>
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
              direction="column"
              flexGrow="1"
            >
              <Outlet />
            </Flex>
            <Footer />
            <TanStackReactQueryDevtools />
            <TanStackRouterDevtools />
          </Flex>
          <Toaster />
        </TransactionNotificationProvider>
      </Web3Provider>
      <Analytics />
    </Provider>
  )
}
