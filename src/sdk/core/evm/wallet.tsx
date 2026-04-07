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

/**
 * Creates a browser-side EVM WalletAdapter backed by wagmi actions and a connector UI.
 *
 * @precondition config.chains.length >= 1
 * @precondition config.connector provides createConfig and WalletProvider
 * @postcondition returned adapter.chainType === 'evm'
 * @postcondition returned adapter.supportedChains matches config.chains (mapped via fromViemChain)
 * @invariant adapter.chainType never changes after construction
 * @invariant adapter.supportedChains never changes after construction
 */
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

    /**
     * Connects to the first available wagmi connector.
     *
     * @precondition none (can be called when already connected — reconnects)
     * @postcondition getStatus().connected === true
     * @postcondition result.accounts.length >= 1
     * @postcondition result.activeAccount is included in result.accounts
     * @throws {WalletNotInstalledError} if no connector is available
     * @throws {WalletConnectionRejectedError} if user cancels
     * @throws {ChainNotSupportedError} if options.chainId is not in supportedChains
     */
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

    /**
     * Restores a previous wallet session on page reload.
     *
     * @precondition none
     * @postcondition if session exists -> returns WalletConnection, getStatus().connected === true
     * @postcondition if no session -> returns null, getStatus() unchanged
     */
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

    /**
     * Disconnects the active wallet session.
     *
     * @precondition none (no-op if already disconnected)
     * @postcondition getStatus().connected === false
     * @postcondition getSigner() === null
     */
    async disconnect(): Promise<void> {
      await disconnect(wagmiConfig)
    },

    /**
     * Returns the current wallet connection status snapshot.
     *
     * @precondition none (callable at any time)
     * @postcondition returns current snapshot — not reactive
     * @invariant if connected === false -> activeAccount === null, connectedChainIds === []
     * @invariant if connected === true -> activeAccount !== null, connectedChainIds.length >= 1
     */
    getStatus(): WalletStatus {
      return toWalletStatus(getAccount(wagmiConfig))
    },

    /**
     * Subscribes to wallet status changes (account and chain changes).
     *
     * @precondition none
     * @postcondition listener fires on every status change
     * @returns unsubscribe function — calling it stops notifications
     */
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

    /**
     * Signs an arbitrary message with the connected wallet.
     *
     * @precondition getStatus().connected === true
     * @postcondition result.address matches the signing account
     * @throws {WalletNotConnectedError} if precondition violated
     * @throws {SigningRejectedError} if user cancels
     */
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

    /**
     * Signs EIP-712 typed data with the connected wallet.
     *
     * @precondition getStatus().connected === true
     * @precondition metadata.capabilities.signTypedData === true
     * @postcondition result.address matches the signing account
     * @throws {WalletNotConnectedError} if not connected
     * @throws {SigningRejectedError} if user cancels
     */
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

    /**
     * Returns the chain-native signer (wagmi WalletClient) for transaction execution.
     *
     * @precondition none
     * @postcondition if connected -> returns chain-native signer (never null)
     * @postcondition if not connected -> returns null
     */
    async getSigner(): Promise<ChainSigner | null> {
      const account = getAccount(wagmiConfig)
      if (!account.isConnected) {
        return null
      }
      return getWalletClient(wagmiConfig)
    },

    /**
     * Switches the connected wallet to the specified chain.
     *
     * @precondition getStatus().connected === true
     * @precondition chainId is in supportedChains
     * @postcondition chainId is included in getStatus().connectedChainIds
     * @throws {WalletNotConnectedError} if not connected
     * @throws {ChainNotSupportedError} if chainId not in supportedChains
     */
    async switchChain(chainId: string | number): Promise<void> {
      const account = getAccount(wagmiConfig)
      if (!account.isConnected) {
        throw new WalletNotConnectedError()
      }
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
