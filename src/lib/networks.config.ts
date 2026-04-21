// networks.config.ts
/**
 * This file contains the configuration for the networks used in the application.
 *
 * @packageDocumentation
 */
import { http, type Transport } from 'viem'
import { arbitrum, mainnet, optimism, optimismSepolia, polygon, sepolia } from 'viem/chains'

import { includeTestnets } from '@/src/constants/common'
import { env } from '@/src/env'

const devChains = [optimismSepolia, sepolia] as const
const prodChains = [mainnet, polygon, arbitrum, optimism] as const
const allChains = [...devChains, ...prodChains] as const
export const chains = includeTestnets ? allChains : prodChains
export type ChainsIds = (typeof chains)[number]['id']

export const rpcUrls = {
  [mainnet.id]: env.PUBLIC_RPC_MAINNET || 'https://ethereum-rpc.publicnode.com',
  [arbitrum.id]: env.PUBLIC_RPC_ARBITRUM || 'https://arbitrum-one-rpc.publicnode.com',
  [optimism.id]: env.PUBLIC_RPC_OPTIMISM || 'https://optimism-rpc.publicnode.com',
  [optimismSepolia.id]:
    env.PUBLIC_RPC_OPTIMISM_SEPOLIA || 'https://optimism-sepolia-rpc.publicnode.com',
  [polygon.id]: env.PUBLIC_RPC_POLYGON || 'https://polygon-bor-rpc.publicnode.com',
  [sepolia.id]: env.PUBLIC_RPC_SEPOLIA || 'https://ethereum-sepolia-rpc.publicnode.com',
} as const satisfies Record<ChainsIds, string>

type RestrictedTransports = Record<ChainsIds, Transport>
export const transports: RestrictedTransports = {
  [mainnet.id]: http(rpcUrls[mainnet.id]),
  [arbitrum.id]: http(rpcUrls[arbitrum.id]),
  [optimism.id]: http(rpcUrls[optimism.id]),
  [optimismSepolia.id]: http(rpcUrls[optimismSepolia.id]),
  [polygon.id]: http(rpcUrls[polygon.id]),
  [sepolia.id]: http(rpcUrls[sepolia.id]),
}
