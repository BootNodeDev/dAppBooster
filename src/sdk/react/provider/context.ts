import type { RefObject } from 'react'
import { createContext, useContext } from 'react'
import type { TransactionLifecycle, WalletLifecycle } from '../../core/adapters/lifecycle'
import type { ReadClientFactory } from '../../core/adapters/provider'
import type { TransactionAdapter } from '../../core/adapters/transaction'
import type { WalletAdapter } from '../../core/adapters/wallet'
import type { ChainRegistry } from '../../core/chain/registry'

export interface DAppBoosterContextValue {
  walletAdapters: Record<string, WalletAdapter>
  transactionAdapters: Record<string, TransactionAdapter>
  registry: ChainRegistry
  lifecycle: TransactionLifecycle | undefined
  walletLifecycle: WalletLifecycle | undefined
  readClientFactories: ReadClientFactory<unknown>[]
  /** Per-adapter modal openers, populated by bridge components inside bundle providers. */
  connectModalsRef: RefObject<Record<string, { open: () => void; openAccount?: () => void }>>
}

export const DAppBoosterContext = createContext<DAppBoosterContextValue | null>(null)

export function useProviderContext(): DAppBoosterContextValue {
  const context = useContext(DAppBoosterContext)
  if (!context) {
    throw new Error('useProviderContext must be called inside a DAppBoosterProvider.')
  }
  return context
}
