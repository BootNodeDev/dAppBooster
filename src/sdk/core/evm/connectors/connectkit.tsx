import { ConnectKitProvider, getDefaultConfig, useModal } from 'connectkit'
import type { FC, ReactNode } from 'react'
import type { Chain, Transport } from 'viem'
import { createConfig } from 'wagmi'
import { env } from '@/src/env'

import type { EvmConnectorConfig } from '../types'

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

/** ConnectKit-backed EVM connector. */
export const connectkitConnector: EvmConnectorConfig = {
  createConfig(chains: Chain[], transports: Record<number, Transport>) {
    const connectkitParams = getDefaultConfig({
      chains: chains as [Chain, ...Chain[]],
      transports,
      walletConnectProjectId: env.PUBLIC_WALLETCONNECT_PROJECT_ID,
      appName: env.PUBLIC_APP_NAME,
      appDescription: env.PUBLIC_APP_DESCRIPTION,
      appUrl: env.PUBLIC_APP_URL,
      appIcon: env.PUBLIC_APP_LOGO,
    })
    return createConfig(connectkitParams)
  },
  WalletProvider,
  useConnectModal,
}
