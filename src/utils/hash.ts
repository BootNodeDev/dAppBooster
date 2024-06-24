import { Address, Chain, Hash, Transaction, createPublicClient, http, isAddress } from 'viem'
import { getBytecode, getEnsAddress, getEnsName, getTransaction } from 'viem/actions'
import { normalize } from 'viem/ens'

export type DetectHash = {
  chain: Chain
  hashOrString: string
}

export const isHex = (str: string) => /^[0-9a-fA-F]+$/.test(str)

export const isValidEnsName = (str: string) => /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/.test(str)

export const isValidTransactionHash = (str: string) =>
  str.length === 66 && str.startsWith('0x') && isHex(str.slice(2))

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

export const detectEnsName = async (
  publicClient: ReturnType<typeof createPublicClientInstance>,
  ensName: string,
): Promise<{ type: HashType; data: HashData }> => {
  try {
    const address = await getEnsAddress(publicClient, {
      name: normalize(ensName),
    })

    if (!address) {
      throw new Error('ENS name not found')
    }

    return {
      type: 'ENS',
      data: address,
    }
  } catch {
    return {
      type: null,
      data: null,
    }
  }
}

export const detectTransactionHash = async (
  publicClient: ReturnType<typeof createPublicClientInstance>,
  hash: Hash,
): Promise<{ type: HashType; data: HashData }> => {
  try {
    const transaction = await getTransaction(publicClient, {
      hash,
    })

    if (!transaction) {
      throw new Error('Transaction not found')
    }

    return {
      type: 'transaction',
      data: transaction,
    }
  } catch {
    return {
      type: null,
      data: null,
    }
  }
}

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
  } catch {
    return {
      type: null,
      data: null,
    }
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
 * const chain = mainnet;
 * const hashOrString = '0x87885aaeeded51c7e3858a782644f5d89759f245';
 * const detected = await detectHash({ chain, hashOrString });
 * { type: 'EOA', data: 'my-ens-name.eth' }
 **/

const detectHash = async ({ chain, hashOrString }: DetectHash): Promise<DetectedHash> => {
  // Check if the input is a valid address, transaction hash, or ENS name
  if (
    !isAddress(hashOrString) &&
    !isValidTransactionHash(hashOrString) &&
    !isValidEnsName(hashOrString)
  ) {
    return {
      type: null,
      data: null,
    }
  }

  const publicClient = createPublicClientInstance(chain)

  // Check if it's an ENS name
  if (isValidEnsName(hashOrString)) {
    return detectEnsName(publicClient, hashOrString)
  }

  // Check if it's a transaction hash
  if (isValidTransactionHash(hashOrString)) {
    return detectTransactionHash(publicClient, hashOrString as Hash)
  }

  // Check if it's an address
  if (isAddress(hashOrString)) {
    return detectAddressType(publicClient, hashOrString)
  }

  return {
    type: null,
    data: null,
  }
}

export default detectHash
