import type { FC, ReactNode } from 'react'
import type { Abi, Address, Chain, Hex, Transport } from 'viem'
import type { Config } from 'wagmi'

/** Raw EVM transaction — direct calldata to an address. */
export interface EvmRawTransaction {
  to: Address
  data?: Hex
  value?: bigint
  gas?: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
}

/** EVM contract call — typed ABI invocation. */
export interface EvmContractCall {
  contract: {
    address: Address
    abi: Abi
    functionName: string
    args?: unknown[]
  }
  value?: bigint
  gas?: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
}

/** EVM transaction payload — discriminated union of raw tx or contract call. */
export type EvmTransactionPayload = EvmRawTransaction | EvmContractCall

/** Core (framework-agnostic) EVM connector config. */
export interface EvmCoreConnectorConfig {
  createConfig(chains: Chain[], transports: Record<number, Transport>): Config
}

/** React-layer EVM connector config — extends core with UI components. */
export interface EvmConnectorConfig extends EvmCoreConnectorConfig {
  WalletProvider: FC<{ children: ReactNode }>
  /** Hook that returns functions to open the connector's connect and account modals. */
  useConnectModal: () => { open: () => void; openAccount?: () => void }
}
