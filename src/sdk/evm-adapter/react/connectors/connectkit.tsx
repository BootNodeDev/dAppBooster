import { ConnectKitProvider, getDefaultConfig, useModal } from 'connectkit'
import type { FC, ReactNode } from 'react'
import type { Chain, Transport } from 'viem'
import { createConfig } from 'wagmi'

import type { ConnectorAppMetadata, EvmConnectorConfig } from '../types'

const WalletProvider: FC<{ children: ReactNode }> = ({ children }) => (
  <ConnectKitProvider
    options={{
      initialChainId: 0,
      enforceSupportedChains: false,
    }}
  >
    {children}
  </ConnectKitProvider>
)

function useConnectModal() {
  const { setOpen } = useModal()
  return { open: () => setOpen(true) }
}

/**
 * Creates a ConnectKit-backed EVM connector from app metadata.
 *
 * @expects metadata.appName and metadata.walletConnectProjectId are non-empty strings
 * @postcondition returns an EvmConnectorConfig with ConnectKit's WalletProvider and useConnectModal
 */
export function createConnectkitConnector(metadata: ConnectorAppMetadata): EvmConnectorConfig {
  return {
    createConfig(chains: Chain[], transports: Record<number, Transport>) {
      const connectkitParams = getDefaultConfig({
        chains: chains as [Chain, ...Chain[]],
        transports,
        walletConnectProjectId: metadata.walletConnectProjectId,
        appName: metadata.appName,
        appDescription: metadata.appDescription,
        appUrl: metadata.appUrl,
        appIcon: metadata.appIcon,
      })
      return createConfig(connectkitParams)
    },
    WalletProvider,
    useConnectModal,
  }
}
