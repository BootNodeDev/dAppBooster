import {
  http,
  type Address,
  type Chain,
  type Hash,
  type Transaction,
  createPublicClient,
  isAddress,
  isHex,
} from 'viem'
import { getBytecode, getEnsAddress, getTransaction } from 'viem/actions'
import { normalize } from 'viem/ens'

export type DetectHash = {
  chain: Chain
  hashOrString: string
}

type HashType = 'contract' | 'transaction' | 'ENS' | 'EOA' | null

type HashData = Transaction | Address | string | null

export type DetectedHash = {
  type: HashType
  data: HashData
}

export const createPublicClientInstance = (chain: Chain) =>
  createPublicClient({
    chain,
    transport: http(),
  })

const invalidHashReturn = {
  type: null,
  data: null,
}

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
 * public client. It returns both the resolved address and a type classification.
 *
 * @param {ReturnType<typeof createPublicClientInstance>} publicClient - The Viem public client instance
 * @param {string} ensName - The ENS name to resolve
 * @returns {Promise<{ type: HashType; data: HashData }>} Object containing the type ('ENS' if valid, null if invalid)
 * and data (resolved address if valid, null if invalid)
 *
 * @example
 * ```tsx
 * // For a valid ENS name
 * const client = createPublicClientInstance(mainnet);
 * const result = await detectEnsName(client, 'vitalik.eth');
 * console.log(result);
 * // { type: 'ENS', data: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' }
 * ```
 *
 * @example
 * ```tsx
 * // For an invalid ENS name
 * const result = await detectEnsName(client, 'nonexistent-name.eth');
 * console.log(result);
 * // { type: null, data: null }
 * ```
 */
export const detectEnsName = async (
  publicClient: ReturnType<typeof createPublicClientInstance>,
  ensName: string,
): Promise<{ type: HashType; data: HashData }> => {
  // try to normalize the ENS name
  let normalizedEnsName: string

  try {
    normalizedEnsName = normalize(ensName)
  } catch (err) {
    console.error(err)
    return invalidHashReturn
  }

  try {
    const address = await getEnsAddress(publicClient, {
      name: normalizedEnsName,
    })

    if (!address) {
      return invalidHashReturn
    }

    return {
      type: 'ENS',
      data: address,
    }
  } catch (err) {
    console.error(err)
    return invalidHashReturn
  }
}

/**
 * Attempts to retrieve transaction data for a given transaction hash.
 *
 * This function queries the blockchain using a provided public client to verify
 * if the hash corresponds to a valid transaction. If found, returns transaction
 * data along with its type classification.
 *
 * @param {ReturnType<typeof createPublicClientInstance>} publicClient - The Viem public client instance
 * @param {Hash} hash - The transaction hash to verify and retrieve
 * @returns {Promise<{ type: HashType; data: HashData }>} Object containing the type ('transaction' if valid, null if invalid)
 * and data (transaction object if valid, null if invalid)
 *
 * @example
 * ```tsx
 * // For a valid transaction hash
 * const client = createPublicClientInstance(mainnet);
 * const result = await detectTransactionHash(client, '0x4a81638d3cc0d169cb559d165c166f832e2e749847b91d96094f958e8c2b9f91');
 * console.log(result);
 * // { type: 'transaction', data: { blockHash: '0x...', blockNumber: 14000000n, ... } }
 * ```
 *
 * @example
 * ```tsx
 * // For an invalid transaction hash
 * const result = await detectTransactionHash(client, '0xabcd1234...');
 * console.log(result);
 * // { type: null, data: null }
 * ```
 */
export const detectTransactionHash = async (
  publicClient: ReturnType<typeof createPublicClientInstance>,
  hash: Hash,
): Promise<{ type: HashType; data: HashData }> => {
  try {
    const transaction = await getTransaction(publicClient, {
      hash,
    })

    if (!transaction) {
      return invalidHashReturn
    }

    return {
      type: 'transaction',
      data: transaction,
    }
  } catch (err) {
    console.error(err)
    return invalidHashReturn
  }
}

/**
 * Determines whether the provided address is a contract or an Externally Owned Account (EOA).
 *
 * The function queries the blockchain to check if there is bytecode deployed at the given address.
 * If bytecode exists, the address is classified as a contract. Otherwise, it's considered an EOA.
 *
 * @param {ReturnType<typeof createPublicClientInstance>} publicClient - The Viem public client instance
 * @param {Address} address - The blockchain address to check
 * @returns {Promise<{ type: HashType; data: HashData }>} Object containing the address type ('contract' or 'EOA') and the address itself
 *
 * @example
 * ```tsx
 * // For a contract address
 * const client = createPublicClientInstance(mainnet);
 * const result = await detectAddressType(client, '0x6B175474E89094C44Da98b954EedeAC495271d0F');
 * console.log(result); // { type: 'contract', data: '0x6B175474E89094C44Da98b954EedeAC495271d0F' }
 * ```
 *
 * @example
 * ```tsx
 * // For a wallet address (EOA)
 * const result = await detectAddressType(client, '0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
 * console.log(result); // { type: 'EOA', data: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' }
 * ```
 */
export const detectAddressType = async (
  publicClient: ReturnType<typeof createPublicClientInstance>,
  address: Address,
): Promise<{ type: HashType; data: HashData }> => {
  try {
    const code = await getBytecode(publicClient, {
      address,
    })

    return {
      type: code && code !== '0x' ? 'contract' : 'EOA',
      data: address,
    }
  } catch (err) {
    console.error(err)
    return invalidHashReturn
  }
}

/**
 * Detects the type of a given hash or string.
 * The function checks if the input is a valid address, transaction hash, or ENS name.
 * If the input is a valid address, it checks if it's a contract or an EOA.
 * If the input is an EOA, it fetches the associated ENS name.
 * If the input is a valid transaction hash, it fetches the transaction details.
 * If the input is a valid ENS name, it fetches the address associated with the name.
 *
 * @param {chain} - The chain to use for detection
 * @param {hashOrString} - The hash or string to detect
 * @returns {Promise<DetectedHash>} The detected hash type and data
 * @example
 * ```tsx
 * const chain = mainnet;
 * const hashOrString = '0x87885aaeeded51c7e3858a782644f5d89759f245';
 * const detected = await detectHash({ chain, hashOrString });
 * { type: 'EOA', data: 'my-ens-name.eth' }
 * ```
 **/
const detectHash = async ({ chain, hashOrString }: DetectHash): Promise<DetectedHash> => {
  const publicClient = createPublicClientInstance(chain)

  // Check if it's a transaction hash
  if (isValidTransactionHash(hashOrString)) {
    return detectTransactionHash(publicClient, hashOrString as Hash)
  }

  // Check if it's an address
  if (isAddress(hashOrString)) {
    return detectAddressType(publicClient, hashOrString)
  }

  return detectEnsName(publicClient, hashOrString)
}

export default detectHash
