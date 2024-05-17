import { http, type Transport } from 'viem'
import { mainnet, optimismSepolia, sepolia } from 'viem/chains'

import { env } from '@/src/env'

export const chains = [mainnet, optimismSepolia, sepolia] as const

type RestrictedTransports = Record<(typeof chains)[number]['id'], Transport>

export const transports: RestrictedTransports = {
  [mainnet.id]: http(
    env.PUBLIC_ALCHEMY_ID
      ? `https://eth-mainnet.g.alchemy.com/v2/${env.PUBLIC_ALCHEMY_ID}`
      : undefined,
  ),
  [optimismSepolia.id]: http('https://sepolia.optimism.io'),
  [sepolia.id]: http(),
}
