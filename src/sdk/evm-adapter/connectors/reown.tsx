import { createAppKit, useAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import type { FC, PropsWithChildren } from 'react'
import type { Chain, Transport } from 'viem'

import type { ConnectorAppMetadata, EvmConnectorConfig } from '../react/types'

const WalletProvider: FC<PropsWithChildren> = ({ children }) => <>{children}</>

function useConnectModal() {
  const { open } = useAppKit()
  return { open }
}

/** Creates a Reown/AppKit-backed EVM connector from app metadata. */
export function createReownConnector(metadata: ConnectorAppMetadata): EvmConnectorConfig {
  return {
    createConfig(chains: Chain[], transports: Record<number, Transport>) {
      const wagmiAdapter = new WagmiAdapter({
        networks: chains as unknown as Chain[],
        transports,
        projectId: metadata.walletConnectProjectId,
      })

      createAppKit({
        adapters: [wagmiAdapter],
        networks: chains as unknown as [Chain, ...Chain[]],
        metadata: {
          name: metadata.appName,
          description: metadata.appDescription ?? '',
          url: metadata.appUrl ?? '',
          icons: [metadata.appIcon ?? ''],
        },
        projectId: metadata.walletConnectProjectId,
        features: {
          analytics: true,
        },
      })

      return wagmiAdapter.wagmiConfig
    },
    WalletProvider,
    useConnectModal,
  }
}
