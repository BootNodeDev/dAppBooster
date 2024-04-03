import { HttpTransport } from 'viem'
import { createConfig } from 'wagmi'

import {
  supportedTestChains,
  transports,
  testTransports,
  supportedChains,
} from '@/app/_lib/chains.config'

if (!process.env.NEXT_PUBLIC_WC_PROJECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_WC_PROJECT_ID env variable')
}

if (!process.env.NEXT_PUBLIC_APP_NAME) {
  throw new Error('Missing NEXT_PUBLIC_APP_NAME env variable')
}

const isEnableTestnets = process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true'

export const wagmiConfig = createConfig({
  chains: [...supportedChains, ...(isEnableTestnets ? supportedTestChains : [])],
  transports: {
    ...transports,
    ...(isEnableTestnets ? testTransports : ({} as Record<number, HttpTransport>)),
  },
  ssr: true,
})

export const queryClientConfig = {
  defaultOptions: {
    queries: {
      // With SSR, we usually want to set some default staleTime
      // above 0 to avoid refetching immediately on the client
      staleTime: 60 * 1000,
    },
  },
}
