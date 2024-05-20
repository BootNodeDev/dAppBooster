import { http, type Transport } from 'viem'
import { mainnet, optimismSepolia, sepolia } from 'viem/chains'

import { env } from '@/src/env'

export const chains = [mainnet, optimismSepolia, sepolia] as const

type RestrictedTransports = Record<(typeof chains)[number]['id'], Transport>

export const transports: RestrictedTransports = {
  [mainnet.id]: http(env.PUBLIC_RPC_MAINNET),
  [optimismSepolia.id]: http(env.PUBLIC_RPC_OP_SEPOLIA),
  [sepolia.id]: http(env.PUBLIC_RPC_SEPOLIA),
}
