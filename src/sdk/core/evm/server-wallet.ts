/**
 * Private-key EVM wallet adapter for server-side usage.
 * No UI, no browser connector — always-connected via supplied private key.
 */

import type { Chain, Hex, Transport } from 'viem'
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

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
import { CapabilityNotSupportedError } from '../errors'
import { fromViemChain } from './chains'

export interface EvmServerWalletConfig {
  privateKey: Hex
  chain: Chain
  transport?: Transport
}

/**
 * Creates a server-side EVM wallet adapter backed by a private key.
 * Returns no Provider — server wallets have no UI layer.
 */
export function createEvmServerWallet(config: EvmServerWalletConfig): WalletAdapterBundle {
  const account = privateKeyToAccount(config.privateKey)
  const walletClient = createWalletClient({
    account,
    chain: config.chain,
    transport: config.transport ?? http(),
  })

  const supportedChains = [fromViemChain(config.chain)]

  const adapter: WalletAdapter<'evm'> = {
    chainType: 'evm',
    supportedChains,

    metadata: {
      chainType: 'evm',
      capabilities: { signTypedData: true, switchChain: false },
      formatAddress(address: string): string {
        return address
      },
      availableWallets(): WalletInfo[] {
        // Server wallets have no user-facing wallet list.
        return []
      },
    },

    async connect(_options?: ConnectOptions): Promise<WalletConnection> {
      return {
        accounts: [account.address],
        activeAccount: account.address,
        chainId: config.chain.id,
      }
    },

    // Server wallet is always connected — reconnect() always returns a connection, never null.
    async reconnect(): Promise<WalletConnection | null> {
      return {
        accounts: [account.address],
        activeAccount: account.address,
        chainId: config.chain.id,
      }
    },

    async disconnect(): Promise<void> {
      // no-op: private key wallet is always connected
    },

    getStatus(): WalletStatus {
      return {
        connected: true,
        activeAccount: account.address,
        connectedChainIds: [config.chain.id],
        connecting: false,
      }
    },

    onStatusChange(listener: (status: WalletStatus) => void): () => void {
      // Emit current status immediately so callers receive initial state without polling.
      listener({
        connected: true,
        activeAccount: account.address,
        connectedChainIds: [config.chain.id],
        connecting: false,
      })
      return () => {
        // no-op: status never changes for a private key wallet
      }
    },

    async signMessage(input: SignMessageInput): Promise<SignatureResult> {
      const message = input.message instanceof Uint8Array ? { raw: input.message } : input.message
      const signature = await walletClient.signMessage({ message } as Parameters<
        typeof walletClient.signMessage
      >[0])
      return { signature, address: account.address }
    },

    async signTypedData(input: SignTypedDataInput): Promise<SignatureResult> {
      const signature = await walletClient.signTypedData({
        domain: input.domain,
        types: input.types,
        primaryType: input.primaryType,
        message: input.message,
      } as Parameters<typeof walletClient.signTypedData>[0])
      return { signature, address: account.address }
    },

    async getSigner(): Promise<ChainSigner | null> {
      return walletClient
    },

    async switchChain(_chainId: string | number): Promise<void> {
      throw new CapabilityNotSupportedError('switchChain')
    },
  }

  return { adapter }
}
