/**
 * React bundle wrapper around the core EVM wallet adapter.
 * Adds WagmiProvider, QueryClientProvider, and the connector's WalletProvider.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { FC, ReactNode } from 'react'
import type { Chain, Transport } from 'viem'
import { type Config, WagmiProvider } from 'wagmi'

import type { WalletAdapterBundle } from '../../core/adapters/provider'
import { createEvmWalletAdapter } from '../../core/evm/wallet'
import type { EvmConnectorConfig } from './types'

// ---------------------------------------------------------------------------
// Public config interface
// ---------------------------------------------------------------------------

export interface EvmWalletBundleConfig {
  connector: EvmConnectorConfig
  chains: Chain[]
  transports: Record<number, Transport>
  /** Pre-created wagmi Config. If provided, used directly instead of calling connector.createConfig(). */
  wagmiConfig?: Config
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a React-ready EVM WalletAdapterBundle — adapter + Provider + useConnectModal.
 * Wraps the core createEvmWalletAdapter with WagmiProvider, QueryClientProvider, and the
 * connector's WalletProvider.
 *
 * @precondition config.chains.length >= 1
 * @precondition config.connector provides createConfig, WalletProvider, and useConnectModal
 * @postcondition returned bundle.adapter.chainType === 'evm'
 * @postcondition returned bundle.Provider wraps children with wagmi + query + connector providers
 */
export function createEvmWalletBundle(config: EvmWalletBundleConfig): WalletAdapterBundle {
  const adapter = createEvmWalletAdapter({
    coreConnector: config.connector,
    chains: config.chains,
    transports: config.transports,
    wagmiConfig: config.wagmiConfig,
  })

  const { wagmiConfig } = adapter
  const queryClient = new QueryClient()

  const Provider: FC<{ children: ReactNode }> = ({ children }) => (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <config.connector.WalletProvider>{children}</config.connector.WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )

  return { adapter, Provider, useConnectModal: config.connector.useConnectModal }
}
