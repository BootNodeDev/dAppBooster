import {
  getDefaultConfig,
  RainbowKitProvider,
  useAccountModal as useRainbowAccountModal,
  useConnectModal as useRainbowConnectModal,
} from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import type { FC, ReactNode } from 'react'
import type { Chain, Transport } from 'viem'

import type { ConnectorAppMetadata, EvmConnectorConfig } from '../types'

const WalletProvider: FC<{ children: ReactNode }> = ({ children }) => (
  <RainbowKitProvider>{children}</RainbowKitProvider>
)

function useConnectModal() {
  const { openConnectModal } = useRainbowConnectModal()
  const { openAccountModal } = useRainbowAccountModal()
  return {
    open: () => openConnectModal?.(),
    openAccount: () => openAccountModal?.(),
  }
}

/**
 * Creates a RainbowKit-backed EVM connector from app metadata.
 *
 * @expects metadata.appName and metadata.walletConnectProjectId are non-empty strings
 * @postcondition returns an EvmConnectorConfig with RainbowKit's WalletProvider and useConnectModal/useAccountModal
 */
export function createRainbowkitConnector(metadata: ConnectorAppMetadata): EvmConnectorConfig {
  return {
    createConfig(chains: Chain[], transports: Record<number, Transport>) {
      return getDefaultConfig({
        chains: chains as [Chain, ...Chain[]],
        transports,
        projectId: metadata.walletConnectProjectId,
        appName: metadata.appName,
        appDescription: metadata.appDescription,
        appUrl: metadata.appUrl,
        appIcon: metadata.appIcon,
      })
    },
    WalletProvider,
    useConnectModal,
  }
}
