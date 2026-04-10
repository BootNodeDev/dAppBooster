/**
 * Private-key EVM wallet adapter for server-side usage.
 * No UI, no browser connector — always-connected via supplied private key.
 */

import type { Chain, Hex, Transport } from 'viem'
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import type { WalletAdapterBundle } from '../core/adapters/provider'
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
} from '../core/adapters/wallet'
import { CapabilityNotSupportedError } from '../core/errors'
import { fromViemChain } from './chains'

export interface EvmServerWalletConfig {
  privateKey: Hex
  chain: Chain
  transport?: Transport
}

/**
 * Creates a server-side EVM wallet adapter backed by a private key.
 * Returns no Provider — server wallets have no UI layer.
 *
 * @precondition config.privateKey is a valid hex-encoded private key
 * @expects config.chain is a valid viem Chain
 * @postcondition returned adapter.chainType === 'evm'
 * @postcondition returned bundle has no Provider (server wallets have no UI)
 * @invariant adapter.chainType never changes after construction
 * @invariant adapter.supportedChains never changes after construction
 * @invariant getStatus().connected === true (always connected)
 */
export function createEvmServerWallet(config: EvmServerWalletConfig): WalletAdapterBundle {
  if (!config.privateKey.startsWith('0x') || config.privateKey.length !== 66) {
    throw new Error(
      'createEvmServerWallet: privateKey must be a 0x-prefixed 66-character hex string.',
    )
  }
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

    /**
     * No-op connect — server wallet is always connected via private key.
     *
     * @precondition none
     * @postcondition returns WalletConnection with the private key account
     * @postcondition result.accounts.length === 1
     */
    async connect(_options?: ConnectOptions): Promise<WalletConnection> {
      return {
        accounts: [account.address],
        activeAccount: account.address,
        chainId: config.chain.id,
      }
    },

    /**
     * Always returns a connection — server wallet is always connected.
     *
     * @precondition none
     * @postcondition always returns WalletConnection (never null)
     */
    async reconnect(): Promise<WalletConnection | null> {
      return {
        accounts: [account.address],
        activeAccount: account.address,
        chainId: config.chain.id,
      }
    },

    /**
     * No-op — private key wallet is always connected and cannot be disconnected.
     *
     * @precondition none
     * @postcondition getStatus().connected remains true
     */
    async disconnect(): Promise<void> {
      // no-op: private key wallet is always connected
    },

    /**
     * Returns wallet status — always connected for server wallets.
     *
     * @precondition none
     * @postcondition connected === true
     * @postcondition activeAccount === the private key's derived address
     * @invariant status never changes for a private key wallet
     */
    getStatus(): WalletStatus {
      return {
        connected: true,
        activeAccount: account.address,
        connectedChainIds: [config.chain.id],
        connecting: false,
      }
    },

    /**
     * Emits current status immediately; no further changes occur for a server wallet.
     *
     * @precondition none
     * @postcondition listener fires once with current (always-connected) status
     * @returns unsubscribe function (no-op — status never changes)
     */
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

    /**
     * Signs an arbitrary message with the server wallet's private key.
     *
     * @precondition none (server wallet is always connected)
     * @postcondition result.address matches the private key's derived address
     */
    async signMessage(input: SignMessageInput): Promise<SignatureResult> {
      const message = input.message instanceof Uint8Array ? { raw: input.message } : input.message
      const signature = await walletClient.signMessage({ message } as Parameters<
        typeof walletClient.signMessage
      >[0])
      return { signature, address: account.address }
    },

    /**
     * Signs EIP-712 typed data with the server wallet's private key.
     *
     * @precondition none (server wallet is always connected)
     * @postcondition result.address matches the private key's derived address
     */
    async signTypedData(input: SignTypedDataInput): Promise<SignatureResult> {
      const signature = await walletClient.signTypedData({
        domain: input.domain,
        types: input.types,
        primaryType: input.primaryType,
        message: input.message,
      } as Parameters<typeof walletClient.signTypedData>[0])
      return { signature, address: account.address }
    },

    /**
     * Returns the viem WalletClient — always available for server wallets.
     *
     * @precondition none
     * @postcondition always returns the WalletClient (never null)
     */
    async getSigner(): Promise<ChainSigner | null> {
      return walletClient
    },

    /**
     * Always throws — server wallets are bound to a single chain.
     *
     * @precondition none
     * @throws {CapabilityNotSupportedError} always (switchChain not supported)
     */
    async switchChain(_chainId: string | number): Promise<void> {
      throw new CapabilityNotSupportedError('switchChain')
    },
  }

  return { adapter }
}
