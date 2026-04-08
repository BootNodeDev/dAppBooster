/**
 * Provider and top-level configuration types for the dAppBooster adapter architecture.
 * No runtime code — types only.
 */

// Type-only import — erased at compile time. Used by WalletAdapterBundle.Provider
// which must be JSX-renderable. No runtime React dependency.
import type { FC, ReactNode } from 'react'
import type { ChainDescriptor, EndpointConfig } from '../chain'
import type { TransactionLifecycle, WalletLifecycle } from './lifecycle'
import type { TransactionAdapter } from './transaction'
import type { WalletAdapter } from './wallet'

/** A wallet adapter paired with its optional React context provider. */
export interface WalletAdapterBundle {
  adapter: WalletAdapter
  /** Omit for non-React or headless adapters. */
  Provider?: FC<{ children: ReactNode }>
  /** Hook that returns functions to open the connector's connect and account modals. */
  useConnectModal?: () => { open: () => void; openAccount?: () => void }
}

/**
 * Factory for creating chain-type-specific read-only RPC clients.
 * Used to configure read operations without requiring a connected wallet.
 */
export interface ReadClientFactory {
  readonly chainType: string
  createClient(endpoint: EndpointConfig, chainId: string | number): unknown
}

/**
 * Top-level configuration object for DAppBoosterProvider.
 * All fields are optional — only configure what your app needs.
 */
export interface DAppBoosterConfig {
  /** Wallet adapters keyed by an arbitrary consumer-defined name. */
  wallets?: Record<string, WalletAdapterBundle>
  /** Transaction adapters keyed by chain type (e.g. 'evm', 'svm'). */
  transactions?: Record<string, TransactionAdapter>
  /** Chains the app operates on. Merged with each adapter's supportedChains at runtime. */
  chains?: ChainDescriptor[]
  /** Factories for constructing read-only RPC clients per chain type. */
  readClientFactories?: ReadClientFactory[]
  /** Global transaction lifecycle hooks applied to all transactions. */
  lifecycle?: TransactionLifecycle
  /** Global wallet lifecycle hooks applied to all signing operations. */
  walletLifecycle?: WalletLifecycle
}
