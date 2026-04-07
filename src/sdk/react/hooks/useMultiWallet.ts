import { useEffect, useMemo, useState } from 'react'
import type { WalletStatus } from '../../core/adapters/wallet'
import { wrapSignMessage, wrapSignTypedData } from '../internal/walletLifecycle'
import { useProviderContext } from '../provider/context'
import type { UseWalletReturn } from './useWallet'

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
