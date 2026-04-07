/**
 * EVM implementation of the WalletAdapter interface using @wagmi/core actions.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { FC, ReactNode } from 'react'
import type { Chain, Transport } from 'viem'
import { type Config, WagmiProvider } from 'wagmi'
import {
  connect,
  disconnect,
  getAccount,
  getConnectors,
  getWalletClient,
  reconnect,
  signMessage,
  signTypedData,
  switchChain,
  watchAccount,
  watchChainId,
} from 'wagmi/actions'

import type { WalletAdapterBundle } from '../adapters/provider'
import type {
  ChainSigner,
  ConnectOptions,
  SignatureResult,
  SignMessageInput,
  SignTypedDataInput,
  WalletAdapter,
  WalletConnection,
  WalletInfo,
  WalletStatus,
} from '../adapters/wallet'
import {
  ChainNotSupportedError,
  SigningRejectedError,
  WalletConnectionRejectedError,
  WalletNotConnectedError,
  WalletNotInstalledError,
} from '../errors'
import { fromViemChain } from './chains'
import type { EvmConnectorConfig } from './types'

// ---------------------------------------------------------------------------
// Public config interface
// ---------------------------------------------------------------------------

export interface EvmWalletConfig {
  connector: EvmConnectorConfig
  chains: Chain[]
  transports: Record<number, Transport>
  /** Pre-created wagmi Config. If provided, used directly instead of calling connector.createConfig(). */
  wagmiConfig?: Config
}

// ---------------------------------------------------------------------------
// Error mapping helpers
// ---------------------------------------------------------------------------

function isUserRejection(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }
  return error.name === 'UserRejectedRequestError' || error.message.includes('User rejected')
}

function isConnectorNotFound(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }
  return error.name === 'ConnectorNotFoundError'
}

function mapConnectError(error: unknown): never {
  if (isUserRejection(error)) {
    throw new WalletConnectionRejectedError()
  }
  if (isConnectorNotFound(error)) {
    throw new WalletNotInstalledError()
  }
  throw error
}

function mapSignError(error: unknown): never {
  if (isUserRejection(error)) {
    throw new SigningRejectedError()
  }
  throw error
}

// ---------------------------------------------------------------------------
// Internal: map wagmi account state to WalletStatus
// ---------------------------------------------------------------------------

function toWalletStatus(account: ReturnType<typeof getAccount>): WalletStatus {
  return {
    connected: account.isConnected,
    activeAccount: account.address ?? null,
    connectedChainIds: account.chainId !== undefined ? [account.chainId] : [],
    connecting: account.isConnecting,
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createEvmWalletAdapter(config: EvmWalletConfig): WalletAdapterBundle {
  const wagmiConfig =
    config.wagmiConfig ?? config.connector.createConfig(config.chains, config.transports)
  const supportedChains = config.chains.map(fromViemChain)
  const queryClient = new QueryClient()

  const adapter: WalletAdapter<'evm'> = {
    chainType: 'evm',
    supportedChains,

    metadata: {
      chainType: 'evm',
      capabilities: { signTypedData: true, switchChain: true },
      formatAddress(address: string): string {
        return address
      },
      availableWallets(): WalletInfo[] {
        return getConnectors(wagmiConfig).map((connector) => ({
          id: connector.id,
          name: connector.name,
          icon: connector.icon,
          installed: true,
        }))
      },
    },

    async connect(options?: ConnectOptions): Promise<WalletConnection> {
      const connector = wagmiConfig.connectors[0]
      if (!connector) {
        throw new WalletNotInstalledError()
      }
      const chainId = options?.chainId !== undefined ? Number(options.chainId) : undefined

      if (chainId !== undefined) {
        const isSupported = supportedChains.some((chain) => chain.chainId === chainId)
        if (!isSupported) {
          throw new ChainNotSupportedError(chainId)
        }
      }

      try {
        const result = await connect(wagmiConfig, { connector, chainId })
        const activeAccount = result.accounts[0]
        return {
          accounts: [...result.accounts],
          activeAccount,
          chainId: result.chainId,
        }
      } catch (error) {
        mapConnectError(error)
      }
    },

    async reconnect(): Promise<WalletConnection | null> {
      const results = await reconnect(wagmiConfig)
      if (results.length === 0) {
        return null
      }
      const first = results[0]
      const activeAccount = first.accounts[0]
      return {
        accounts: [...first.accounts],
        activeAccount,
        chainId: first.chainId,
      }
    },

    async disconnect(): Promise<void> {
      await disconnect(wagmiConfig)
    },

    getStatus(): WalletStatus {
      return toWalletStatus(getAccount(wagmiConfig))
    },

    onStatusChange(listener: (status: WalletStatus) => void): () => void {
      const unsubAccount = watchAccount(wagmiConfig, {
        onChange(account) {
          listener(toWalletStatus(account))
        },
      })
      const unsubChain = watchChainId(wagmiConfig, {
        onChange() {
          listener(toWalletStatus(getAccount(wagmiConfig)))
        },
      })
      return () => {
        unsubAccount()
        unsubChain()
      }
    },

    async signMessage(input: SignMessageInput): Promise<SignatureResult> {
      const account = getAccount(wagmiConfig)
      if (!account.isConnected || !account.address) {
        throw new WalletNotConnectedError()
      }

      const message = input.message instanceof Uint8Array ? { raw: input.message } : input.message

      try {
        const signature = await signMessage(wagmiConfig, { message })
        return { signature, address: account.address }
      } catch (error) {
        mapSignError(error)
      }
    },

    async signTypedData(input: SignTypedDataInput): Promise<SignatureResult> {
      const account = getAccount(wagmiConfig)
      if (!account.isConnected || !account.address) {
        throw new WalletNotConnectedError()
      }

      try {
        // Cast needed: public interface uses loose Record types; viem expects its own deep typed-data shapes.
        const signature = await signTypedData(wagmiConfig, {
          domain: input.domain as Parameters<typeof signTypedData>[1]['domain'],
          types: input.types as Parameters<typeof signTypedData>[1]['types'],
          primaryType: input.primaryType,
          message: input.message as Parameters<typeof signTypedData>[1]['message'],
        })
        return { signature, address: account.address }
      } catch (error) {
        mapSignError(error)
      }
    },

    async getSigner(): Promise<ChainSigner | null> {
      const account = getAccount(wagmiConfig)
      if (!account.isConnected) {
        return null
      }
      return getWalletClient(wagmiConfig)
    },

    async switchChain(chainId: string | number): Promise<void> {
      const numericId = typeof chainId === 'string' ? Number.parseInt(chainId, 10) : chainId
      const isSupported = supportedChains.some((chain) => chain.chainId === numericId)
      if (!isSupported) {
        throw new ChainNotSupportedError(chainId)
      }
      // Cast needed: numericId is number; wagmi expects its branded ChainId union type.
      await switchChain(wagmiConfig, {
        chainId: numericId as Parameters<typeof switchChain>[1]['chainId'],
      })
    },
  }

  const Provider: FC<{ children: ReactNode }> = ({ children }) => (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <config.connector.WalletProvider>{children}</config.connector.WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )

  return { adapter, Provider, useConnectModal: config.connector.useConnectModal }
}
