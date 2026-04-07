import { useEffect, useMemo, useState } from 'react'
import type { WalletLifecycle } from '../../core/adapters/lifecycle'
import type {
  SignatureResult,
  SignMessageInput,
  SignTypedDataInput,
  WalletAdapter,
  WalletStatus,
} from '../../core/adapters/wallet'
import { useProviderContext } from '../provider/context'
import type { UseWalletReturn } from './useWallet'

function fireWalletLifecycle<K extends keyof WalletLifecycle>(
  key: K,
  lifecycle: WalletLifecycle | undefined,
  ...args: Parameters<NonNullable<WalletLifecycle[K]>>
): void {
  const fn = lifecycle?.[key] as ((...a: unknown[]) => void) | undefined
  if (!fn) {
    return
  }
  try {
    fn(...(args as unknown[]))
  } catch (err) {
    console.error(`useMultiWallet lifecycle hook "${key}" threw:`, err)
  }
}

function wrapSignMessage(
  adapter: WalletAdapter,
  lifecycle: WalletLifecycle | undefined,
): (input: SignMessageInput) => Promise<SignatureResult> {
  return async (input) => {
    fireWalletLifecycle('onSign', lifecycle, 'message', input)
    try {
      const result = await adapter.signMessage(input)
      fireWalletLifecycle('onSignComplete', lifecycle, result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      fireWalletLifecycle('onSignError', lifecycle, error)
      throw err
    }
  }
}

function wrapSignTypedData(
  adapter: WalletAdapter,
  lifecycle: WalletLifecycle | undefined,
): ((input: SignTypedDataInput) => Promise<SignatureResult>) | undefined {
  if (!adapter.signTypedData) {
    return undefined
  }
  const { signTypedData } = adapter
  return async (input) => {
    fireWalletLifecycle('onSign', lifecycle, 'typedData', input)
    try {
      const result = await signTypedData(input)
      fireWalletLifecycle('onSignComplete', lifecycle, result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      fireWalletLifecycle('onSignError', lifecycle, error)
      throw err
    }
  }
}

/** Returns one UseWalletReturn entry per registered wallet adapter, keyed by adapter name. */
export type UseMultiWalletReturn = Record<string, UseWalletReturn>

/**
 * Returns a record of UseWalletReturn for every registered wallet adapter.
 * Keys match the names used in DAppBoosterConfig.wallets (e.g. 'evm', 'solana').
 */
export function useMultiWallet(): UseMultiWalletReturn {
  const { walletAdapters, walletLifecycle, connectModalsRef } = useProviderContext()

  const [statuses, setStatuses] = useState<Record<string, WalletStatus>>(() =>
    Object.fromEntries(
      Object.entries(walletAdapters).map(([key, adapter]) => [key, adapter.getStatus()]),
    ),
  )

  useEffect(() => {
    // Re-read current statuses on mount (guards against changes between render and effect)
    setStatuses(
      Object.fromEntries(
        Object.entries(walletAdapters).map(([key, adapter]) => [key, adapter.getStatus()]),
      ),
    )
    // Subscribe to all adapters
    const unsubscribes = Object.entries(walletAdapters).map(([key, adapter]) =>
      adapter.onStatusChange((status) => {
        setStatuses((previous) => ({ ...previous, [key]: status }))
      }),
    )
    return () => {
      for (const unsub of unsubscribes) {
        unsub()
      }
    }
  }, [walletAdapters])

  return useMemo(
    () =>
      Object.fromEntries(
        Object.entries(walletAdapters).map(([key, adapter]) => {
          const status = statuses[key] ?? adapter.getStatus()
          const isReady = status.connected
          const needsConnect = !status.connected && !status.connecting
          const needsChainSwitch = false

          return [
            key,
            {
              adapter,
              adapterKey: key,
              status,
              isReady,
              needsConnect,
              needsChainSwitch,
              connect: adapter.connect,
              disconnect: adapter.disconnect,
              signMessage: wrapSignMessage(adapter, walletLifecycle),
              signTypedData: wrapSignTypedData(adapter, walletLifecycle),
              getSigner: adapter.getSigner,
              switchChain: adapter.switchChain,
              openConnectModal: () => {
                connectModalsRef.current[key]?.open()
              },
              openAccountModal: () => {
                const modals = connectModalsRef.current[key]
                if (modals?.openAccount) {
                  modals.openAccount()
                } else {
                  modals?.open()
                }
              },
            },
          ]
        }),
      ),
    [statuses, walletAdapters, walletLifecycle, connectModalsRef],
  )
}
