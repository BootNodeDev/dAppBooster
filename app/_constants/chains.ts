import { HttpTransport, http } from 'viem'
import { mainnet, sepolia } from 'viem/chains'

// Add the chains you want to support here
export const supportedChains = [mainnet] as const

// Add the test chains you want to support here
export const supportedTestChains = [sepolia] as const

export type supportedChainsIds = (typeof supportedChains)[number]['id']
export type supportedTestChainsIds = (typeof supportedTestChains)[number]['id']

export type ChainKeys = supportedChainsIds | supportedTestChainsIds

// build transports for wagmi. RPC url value can be null and will be handled by wagmi using the default providers.
// consider using a .env var for customs rpc urls and use them here to avoid limitation with default providers.
export const transports: Record<supportedChainsIds, HttpTransport> = {
  [mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL_MAINNET),
}

// build transports for testnets.
export const testTransports: Record<supportedTestChainsIds, HttpTransport> = {
  [sepolia.id]: http(), // using default rpc for testnet
}
