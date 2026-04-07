/**
 * WalletAdapter interface and supporting types for the dAppBooster adapter architecture.
 * No runtime code — types only.
 */

import type { ChainDescriptor } from '../chain'

/**
 * Opaque signer handle produced by WalletAdapter and consumed by TransactionAdapter.
 * Concrete adapter implementations narrow this to their chain-specific signer type.
 */
export type ChainSigner = unknown

/** Options passed to connect(). */
export interface ConnectOptions {
  /** Preferred chain to activate after connecting. */
  chainId?: string | number
}

/** Returned by connect() and reconnect() on success. */
export interface WalletConnection {
  accounts: string[]
  activeAccount: string
  chainId?: string | number
}

/** Live wallet state snapshot returned by getStatus() and emitted via onStatusChange(). */
export interface WalletStatus {
  connected: boolean
  /** null when disconnected. */
  activeAccount: string | null
  /** Empty array when disconnected. */
  connectedChainIds: (string | number)[]
  connecting: boolean
}

/** Input for plain message signing. */
export interface SignMessageInput {
  message: string | Uint8Array
}

/** Input for EIP-712 / structured typed-data signing. */
export interface SignTypedDataInput {
  domain: Record<string, unknown>
  types: Record<string, unknown>
  primaryType: string
  message: Record<string, unknown>
}

/** Result returned by all signing operations. */
export interface SignatureResult {
  signature: string
  address: string
  meta?: Record<string, unknown>
}

/** Describes a wallet that can be presented to the user. */
export interface WalletInfo {
  id: string
  name: string
  icon?: string
  installed: boolean
  installUrl?: string
}

/** Static metadata exposed by a WalletAdapter implementation. */
export interface WalletAdapterMetadata {
  chainType: string
  capabilities: {
    signTypedData: boolean
    switchChain: boolean
  }
  /** Format a raw address for display on this chain type. */
  formatAddress(address: string): string
  /** List wallets available in the current environment. */
  availableWallets(): WalletInfo[]
}

/**
 * Adapter interface for wallet connectivity on a single chain type.
 * Implementations provide connect/disconnect, signing, and signer access.
 * TChainType narrows the chainType discriminant for registry lookups.
 */
export interface WalletAdapter<TChainType extends string = string> {
  readonly chainType: TChainType
  readonly supportedChains: ChainDescriptor[]
  readonly metadata: WalletAdapterMetadata

  connect(options?: ConnectOptions): Promise<WalletConnection>
  reconnect(): Promise<WalletConnection | null>
  disconnect(): Promise<void>

  getStatus(): WalletStatus
  /** Subscribe to status changes. Returns an unsubscribe function. */
  onStatusChange(listener: (status: WalletStatus) => void): () => void

  signMessage(input: SignMessageInput): Promise<SignatureResult>
  /** Optional — only present when metadata.capabilities.signTypedData is true. */
  signTypedData?(input: SignTypedDataInput): Promise<SignatureResult>
  /** Returns the active chain signer, or null when disconnected. */
  getSigner(): Promise<ChainSigner | null>
  switchChain(chainId: string | number): Promise<void>
}
