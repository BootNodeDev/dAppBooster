/**
 * Uncomment to use dAppBooster with web3Modal
 * version used: 4.2.1
 */

import { createAppKit } from '@reown/appkit/react'

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import type { DetailedHTMLProps, FC, HTMLAttributes, PropsWithChildren } from 'react'
import type { Chain } from 'viem'
import { env } from '@/src/env'
import { chains } from '@/src/lib/networks.config'

export const WalletProvider: FC<PropsWithChildren> = ({ children }) => children

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-button': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      'appkit-button': DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & { label?: string },
        HTMLElement
      >
    }
  }
}
export const ConnectWalletButton = ({ label = 'Connect' }: { label?: string }) => (
  <appkit-button label={label} />
)

// Required API Keys
const projectId = env.PUBLIC_WALLETCONNECT_PROJECT_ID

const metadata = {
  // Required App Info
  name: env.PUBLIC_APP_NAME,
  description: env.PUBLIC_APP_DESCRIPTION ?? '',
  url: env.PUBLIC_APP_URL ?? '',
  icons: [env.PUBLIC_APP_LOGO ?? ''],
}

// TODO avoid readonly types mismatch
const wagmiAdapter = new WagmiAdapter({
  networks: chains as unknown as Chain[],
  projectId,
})

createAppKit({
  adapters: [wagmiAdapter],
  networks: chains as unknown as [Chain, ...Chain[]],
  metadata: metadata,
  projectId,
  features: {
    analytics: true,
  },
})

export const config = wagmiAdapter.wagmiConfig
