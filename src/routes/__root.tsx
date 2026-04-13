import {
  Footer,
  Header,
  NotificationToast,
  notificationToaster,
  Provider,
  TanStackReactQueryDevtools,
  TanStackRouterDevtools,
  Toaster,
} from '@/src/core/components'
import { chains, transports } from '@/src/core/types'
import { createEvmTransactionAdapter } from '@/src/sdk/evm-adapter'
import { createEvmWalletBundle } from '@/src/sdk/evm-adapter/react'
import {
  createNotificationLifecycle,
  createSigningNotificationLifecycle,
} from '@/src/sdk/react/lifecycle'
import { DAppBoosterProvider } from '@/src/sdk/react/provider'
import { connector, config as wagmiConfig } from '@/src/wallet/connectors/wagmi.config'
import '@/src/wallet/connectors/portoInit'
import { Flex } from '@chakra-ui/react'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import type { Chain } from 'viem'

const evmChains: Chain[] = [...chains]

const evmWalletBundle = createEvmWalletBundle({
  connector,
  chains: evmChains,
  transports,
  wagmiConfig,
})

const evmTransactionAdapter = createEvmTransactionAdapter({
  chains: evmChains,
  transports,
})

const notificationLifecycle = createNotificationLifecycle({
  toaster: notificationToaster,
})

const signingLifecycle = createSigningNotificationLifecycle({
  toaster: notificationToaster,
})

const dappboosterConfig = {
  wallets: { evm: evmWalletBundle },
  transactions: { evm: evmTransactionAdapter },
  lifecycle: notificationLifecycle,
  walletLifecycle: signingLifecycle,
}

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  return (
    <Provider>
      <DAppBoosterProvider config={dappboosterConfig}>
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
        <NotificationToast />
      </DAppBoosterProvider>
      <Analytics />
    </Provider>
  )
}
