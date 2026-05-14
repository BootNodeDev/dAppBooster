// networks.config.ts
/**
 * This file contains the configuration for the networks used in the application.
 *
 * @packageDocumentation
 */
import { http, type Transport } from 'viem'
import {
  arbitrum,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  sepolia,
} from 'viem/chains'

import { env } from '@/src/env'
import { includeTestnets } from './common'

const devChains = [baseSepolia, optimismSepolia, sepolia] as const
const prodChains = [mainnet, polygon, arbitrum, optimism] as const
const allChains = [...devChains, ...prodChains] as const
export const chains = includeTestnets ? allChains : prodChains
export type ChainsIds = (typeof chains)[number]['id']

type RestrictedTransports = Record<ChainsIds, Transport>
export const transports: RestrictedTransports = {
  [mainnet.id]: http(env.PUBLIC_RPC_MAINNET),
  [arbitrum.id]: http(env.PUBLIC_RPC_ARBITRUM),
  [optimism.id]: http(env.PUBLIC_RPC_OPTIMISM),
  [optimismSepolia.id]: http(env.PUBLIC_RPC_OPTIMISM_SEPOLIA),
  [polygon.id]: http(env.PUBLIC_RPC_POLYGON),
  [sepolia.id]: http(env.PUBLIC_RPC_SEPOLIA),
  [baseSepolia.id]: http(env.PUBLIC_RPC_BASE_SEPOLIA),
}

/**
 * RPC URLs paired with `transports`, used to populate chain descriptors so the SDK's
 * read-only path (`useEvmReadOnly`) hits the same RPC as the transaction layer. When a
 * `PUBLIC_RPC_*` env var is unset, falls back to viem's default RPC URL for that chain.
 */
type RestrictedEndpoints = Record<ChainsIds, string>
export const endpoints: RestrictedEndpoints = {
  [mainnet.id]: env.PUBLIC_RPC_MAINNET ?? mainnet.rpcUrls.default.http[0],
  [arbitrum.id]: env.PUBLIC_RPC_ARBITRUM ?? arbitrum.rpcUrls.default.http[0],
  [optimism.id]: env.PUBLIC_RPC_OPTIMISM ?? optimism.rpcUrls.default.http[0],
  [optimismSepolia.id]: env.PUBLIC_RPC_OPTIMISM_SEPOLIA ?? optimismSepolia.rpcUrls.default.http[0],
  [polygon.id]: env.PUBLIC_RPC_POLYGON ?? polygon.rpcUrls.default.http[0],
  [sepolia.id]: env.PUBLIC_RPC_SEPOLIA ?? sepolia.rpcUrls.default.http[0],
  [baseSepolia.id]: env.PUBLIC_RPC_BASE_SEPOLIA ?? baseSepolia.rpcUrls.default.http[0],
}
