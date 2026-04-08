import {
  getDefaultConfig,
  RainbowKitProvider,
  useAccountModal as useRainbowAccountModal,
  useConnectModal as useRainbowConnectModal,
} from '@rainbow-me/rainbowkit'
import { env } from '@/src/env'
import '@rainbow-me/rainbowkit/styles.css'
import type { FC, ReactNode } from 'react'
import type { Chain, Transport } from 'viem'

import type { EvmConnectorConfig } from '../types'

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

/** RainbowKit-backed EVM connector. */
export const rainbowkitConnector: EvmConnectorConfig = {
  createConfig(chains: Chain[], transports: Record<number, Transport>) {
    return getDefaultConfig({
      chains: chains as [Chain, ...Chain[]],
      transports,
      projectId: env.PUBLIC_WALLETCONNECT_PROJECT_ID,
      appName: env.PUBLIC_APP_NAME,
      appDescription: env.PUBLIC_APP_DESCRIPTION,
      appUrl: env.PUBLIC_APP_URL,
      appIcon: env.PUBLIC_APP_LOGO,
    })
  },
  WalletProvider,
  useConnectModal,
}
