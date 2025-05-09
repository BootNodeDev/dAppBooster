import type { FC, PropsWithChildren } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { ConnectWalletButton, WalletProvider, config } from '@/src/lib/wallets/connectkit.config'

const queryClient = new QueryClient()

export { ConnectWalletButton }

/**
 * Provider component for web3 functionality
 *
 * Sets up the necessary providers for blockchain interactions:
 * - WagmiProvider for blockchain connectivity
 * - QueryClientProvider for data fetching
 * - WalletProvider for wallet connection
 *
 * @example
 * ```tsx
 * <Web3Provider>
 *   <App />
 * </Web3Provider>
 * ```
 */
export const Web3Provider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>{children}</WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
