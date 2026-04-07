import { createAppKit, useAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import type { FC, PropsWithChildren } from 'react'
import type { Chain, Transport } from 'viem'
import { env } from '@/src/env'

import type { EvmConnectorConfig } from '../types'

const WalletProvider: FC<PropsWithChildren> = ({ children }) => <>{children}</>

function useConnectModal() {
  const { open } = useAppKit()
  return { open }
}

/** Reown/AppKit-backed EVM connector. */
export const reownConnector: EvmConnectorConfig = {
  createConfig(chains: Chain[], transports: Record<number, Transport>) {
    const projectId = env.PUBLIC_WALLETCONNECT_PROJECT_ID

    const metadata = {
      name: env.PUBLIC_APP_NAME,
      description: env.PUBLIC_APP_DESCRIPTION ?? '',
      url: env.PUBLIC_APP_URL ?? '',
      icons: [env.PUBLIC_APP_LOGO ?? ''],
    }

    const wagmiAdapter = new WagmiAdapter({
      networks: chains as unknown as Chain[],
      transports,
      projectId,
    })

    createAppKit({
      adapters: [wagmiAdapter],
      networks: chains as unknown as [Chain, ...Chain[]],
      metadata,
      projectId,
      features: {
        analytics: true,
      },
    })

    return wagmiAdapter.wagmiConfig
  },
  WalletProvider,
  useConnectModal,
}
