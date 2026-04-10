import type { Abi, Address, Hex } from 'viem'

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
