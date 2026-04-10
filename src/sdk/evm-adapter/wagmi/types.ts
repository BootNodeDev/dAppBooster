import type { Chain, Transport } from 'viem'
import type { Config } from 'wagmi'

/** Core (framework-agnostic) EVM connector config. Wagmi-coupled — returns wagmi Config. */
export interface EvmCoreConnectorConfig {
  createConfig(chains: Chain[], transports: Record<number, Transport>): Config
}
