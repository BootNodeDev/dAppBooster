import {
  Footer,
  Header,
  Provider,
  TanStackReactQueryDevtools,
  TanStackRouterDevtools,
  Toaster,
} from '@/src/core/components'
import { chains, transports } from '@/src/core/types'
import { createEvmTransactionAdapter, createEvmWalletAdapter } from '@/src/sdk/core/evm'
import { DAppBoosterProvider } from '@/src/sdk/react'
import { TransactionNotificationProvider } from '@/src/transactions/providers'
import { connector, config as wagmiConfig } from '@/src/wallet/connectors/wagmi.config'
import '@/src/wallet/connectors/portoInit'
import { Flex } from '@chakra-ui/react'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import type { Chain } from 'viem'

const evmChains: Chain[] = [...chains]

const evmWalletBundle = createEvmWalletAdapter({
  connector,
  chains: evmChains,
  transports,
  wagmiConfig,
})

const evmTransactionAdapter = createEvmTransactionAdapter({
  chains: evmChains,
  transports,
})

const dappboosterConfig = {
  wallets: { evm: evmWalletBundle },
  transactions: { evm: evmTransactionAdapter },
}

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  return (
    <Provider>
      <DAppBoosterProvider config={dappboosterConfig}>
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
      </DAppBoosterProvider>
      <Analytics />
    </Provider>
  )
}
