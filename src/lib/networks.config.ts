import { http, type Transport } from 'viem'
import { mainnet, optimismSepolia, sepolia } from 'viem/chains'

import { isDev } from '@/src/constants/common'
import { env } from '@/src/env'

const devChains = [optimismSepolia, sepolia] as const
const prodChains = [mainnet] as const

export const chains = isDev ? devChains : prodChains

type RestrictedTransports = Record<(typeof chains)[number]['id'], Transport>

export const transports: RestrictedTransports = {
  [mainnet.id]: http(env.PUBLIC_RPC_MAINNET),
  [optimismSepolia.id]: http(env.PUBLIC_RPC_OP_SEPOLIA),
  [sepolia.id]: http(env.PUBLIC_RPC_SEPOLIA),
}
