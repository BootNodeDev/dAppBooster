import {
  type Address,
  type Hash,
  isAddress,
  isHex,
  type PublicClient,
  type Transaction,
} from 'viem'
import { getCode, getEnsAddress, getTransaction } from 'viem/actions'
import { normalize } from 'viem/ens'

export type DetectHash = {
  publicClient: PublicClient
  hashOrString: string
}

export type DetectionResult =
  | { status: 'found'; type: 'transaction'; data: Transaction }
  | { status: 'found'; type: 'contract' | 'EOA' | 'ENS'; data: Address }
  | { status: 'not-found' }
  | { status: 'rpc-error'; error: Error }

const toRpcError = (err: unknown): Extract<DetectionResult, { status: 'rpc-error' }> => ({
  status: 'rpc-error',
  error: err instanceof Error ? err : new Error(String(err)),
})

/**
 * Checks if a string is a valid Ethereum transaction hash.
 *
 * A valid transaction hash must be 66 characters long (including the '0x' prefix)
 * and must be a valid hexadecimal string. This function leverages viem's isHex utility
 * for hex validation.
 *
 * @param {string} str - The string to check
 * @returns {boolean} True if the string is a valid transaction hash, false otherwise
 *
 * @example
 * ```tsx
 * // Check a valid transaction hash
 * isValidTransactionHash('0x4a81638d3cc0d169cb559d165c166f832e2e749847b91d96094f958e8c2b9f91');
 * // Returns: true
 * ```
 */
export const isValidTransactionHash = (str: string) => str.length === 66 && isHex(str)

/**
 * Attempts to resolve an ENS name to its corresponding Ethereum address.
 *
 * This function takes an ENS name (e.g., "vitalik.eth"), normalizes it according to
 * ENS standards, and attempts to resolve it to an Ethereum address using the provided
 * public client.
 *
 * @param {PublicClient} publicClient - The Viem public client instance
 * @param {string} ensName - The ENS name to resolve
 * @returns {Promise<DetectionResult>} Object discriminated by `status` field: `found` with
 * the resolved address, `not-found` if the name does not resolve, or `rpc-error` if the RPC call fails
 *
 * @expects publicClient is a viem PublicClient bound to a chain whose RPC supports
 *   ENS resolver calls (typically mainnet)
 * @postcondition returns DetectionResult — never throws synchronously; errors flow
 *   through { status: 'rpc-error', error }
 *
 * @example
 * ```tsx
 * // For a valid ENS name
 * const { client } = useEvmReadOnly({ chainId: 1 });
 * const result = await detectEnsName(client, 'vitalik.eth');
 * console.log(result);
 * // { status: 'found', type: 'ENS', data: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' }
 * ```
 *
 * @example
 * ```tsx
 * // For an invalid ENS name
 * const result = await detectEnsName(client, 'nonexistent-name.eth');
 * console.log(result);
 * // { status: 'not-found' }
 * ```
 *
 * @example
 * ```tsx
 * // When the RPC call fails
 * const result = await detectEnsName(client, 'vitalik.eth');
 * console.log(result);
 * // { status: 'rpc-error', error: Error }
 * ```
 */
export const detectEnsName = async (
  publicClient: PublicClient,
  ensName: string,
): Promise<DetectionResult> => {
  let normalizedEnsName: string

  try {
    normalizedEnsName = normalize(ensName)
  } catch {
    return { status: 'not-found' }
  }

  try {
    const address = await getEnsAddress(publicClient, { name: normalizedEnsName })

    if (!address) {
      return { status: 'not-found' }
    }

    return { status: 'found', type: 'ENS', data: address }
  } catch (err) {
    return toRpcError(err)
  }
}

/**
 * Attempts to retrieve transaction data for a given transaction hash.
 *
 * This function queries the blockchain using a provided public client to verify
 * if the hash corresponds to a valid transaction.
 *
 * @param {PublicClient} publicClient - The Viem public client instance
 * @param {Hash} hash - The transaction hash to verify and retrieve
 * @returns {Promise<DetectionResult>} Object discriminated by `status` field: `found` with
 * the transaction object, `not-found` if no transaction matches, or `rpc-error` if the RPC call fails
 *
 * @expects publicClient is a viem PublicClient bound to a chain whose RPC supports
 *   eth_getTransactionByHash
 * @postcondition returns DetectionResult — never throws synchronously; errors flow
 *   through { status: 'rpc-error', error }
 *
 * @example
 * ```tsx
 * // For a valid transaction hash
 * const { client } = useEvmReadOnly({ chainId: 1 });
 * const result = await detectTransactionHash(client, '0x4a81638d3cc0d169cb559d165c166f832e2e749847b91d96094f958e8c2b9f91');
 * console.log(result);
 * // { status: 'found', type: 'transaction', data: { blockHash: '0x...', blockNumber: 14000000n, ... } }
 * ```
 *
 * @example
 * ```tsx
 * // For an invalid transaction hash
 * const result = await detectTransactionHash(client, '0xabcd1234...');
 * console.log(result);
 * // { status: 'not-found' }
 * ```
 *
 * @example
 * ```tsx
 * // When the RPC call fails
 * const result = await detectTransactionHash(client, '0x4a81...');
 * console.log(result);
 * // { status: 'rpc-error', error: Error }
 * ```
 */
export const detectTransactionHash = async (
  publicClient: PublicClient,
  hash: Hash,
): Promise<DetectionResult> => {
  try {
    const transaction = await getTransaction(publicClient, { hash })

    if (!transaction) {
      return { status: 'not-found' }
    }

    return { status: 'found', type: 'transaction', data: transaction }
  } catch (err) {
    return toRpcError(err)
  }
}

/**
 * Determines whether the provided address is a contract or an Externally Owned Account (EOA).
 *
 * The function queries the blockchain to check if there is bytecode deployed at the given address.
 * If bytecode exists, the address is classified as a contract. Otherwise, it's considered an EOA.
 *
 * @param {PublicClient} publicClient - The Viem public client instance
 * @param {Address} address - The blockchain address to check
 * @returns {Promise<DetectionResult>} Object discriminated by `status` field: `found` with
 * the address typed as `contract` or `EOA`, or `rpc-error` if the RPC call fails
 *
 * @expects publicClient is a viem PublicClient bound to a chain whose RPC supports
 *   eth_getCode
 * @postcondition returns DetectionResult with status `found` or `rpc-error` — never returns
 *   `not-found` (addresses are always either EOA or contract) and never throws synchronously;
 *   errors flow through { status: 'rpc-error', error }
 *
 * @example
 * ```tsx
 * // For a contract address
 * const { client } = useEvmReadOnly({ chainId: 1 });
 * const result = await detectAddressType(client, '0x6B175474E89094C44Da98b954EedeAC495271d0F');
 * console.log(result); // { status: 'found', type: 'contract', data: '0x6B175474E89094C44Da98b954EedeAC495271d0F' }
 * ```
 *
 * @example
 * ```tsx
 * // For a wallet address (EOA)
 * const result = await detectAddressType(client, '0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
 * console.log(result); // { status: 'found', type: 'EOA', data: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' }
 * ```
 *
 * @example
 * ```tsx
 * // When the RPC call fails
 * const result = await detectAddressType(client, '0x6B17...');
 * console.log(result); // { status: 'rpc-error', error: Error }
 * ```
 */
export const detectAddressType = async (
  publicClient: PublicClient,
  address: Address,
): Promise<Extract<DetectionResult, { status: 'found' | 'rpc-error' }>> => {
  try {
    const code = await getCode(publicClient, { address })

    return {
      status: 'found',
      type: code && code !== '0x' ? 'contract' : 'EOA',
      data: address,
    }
  } catch (err) {
    return toRpcError(err)
  }
}

/**
 * Detects whether a string is a transaction hash, address, or ENS name and looks it up
 * on the supplied chain.
 *
 * The caller owns client creation — typically via the SDK's read-only hook
 * (`useEvmReadOnly`) so the configured RPC is used rather than viem's default
 * public endpoints.
 *
 * @expects publicClient is a viem PublicClient bound to a chain whose RPC supports
 *   eth_getTransactionByHash, eth_getCode, and (for ENS inputs) ENS resolver calls
 * @postcondition returns DetectionResult — never throws synchronously; errors flow
 *   through { status: 'rpc-error', error }
 *
 * @example
 * ```tsx
 * const { client } = useEvmReadOnly({ chainId: 1 })
 * if (client) {
 *   const detected = await detectHash({ publicClient: client, hashOrString })
 *   if (detected.status === 'found') { ... }
 *   if (detected.status === 'rpc-error') { ... }
 * }
 * ```
 */
const detectHash = async ({ publicClient, hashOrString }: DetectHash): Promise<DetectionResult> => {
  if (isValidTransactionHash(hashOrString)) {
    return detectTransactionHash(publicClient, hashOrString as Hash)
  }

  if (isAddress(hashOrString)) {
    return detectAddressType(publicClient, hashOrString)
  }

  return detectEnsName(publicClient, hashOrString)
}

export default detectHash
