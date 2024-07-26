import { type Address, type Chain, type Hash, isAddress, isHash } from 'viem'

export type GetExplorerUrlParams = {
  chain: Chain
  hashOrAddress: Hash | Address
  explorerUrl?: string
}

/**
 * Returns the explorer link for a given chain, explorer URL, and hash or address.
 * You can provide an explorer URL to override the default explorer URL for the chain.
 * @param {GetExplorerUrlParams} params - The parameters for generating the explorer link.
 * @returns {string} - The explorer link.
 * @throws {Error} - If the hash or address is invalid.
 */
export const getExplorerLink = ({ chain, explorerUrl, hashOrAddress }: GetExplorerUrlParams) => {
  if (isAddress(hashOrAddress)) {
    return explorerUrl
      ? `${explorerUrl}/address/${hashOrAddress}`
      : `${chain.blockExplorers?.default.url}/address/${hashOrAddress}`
  }
  if (isHash(hashOrAddress)) {
    return explorerUrl
      ? `${explorerUrl}/tx/${hashOrAddress}`
      : `${chain.blockExplorers?.default}/tx/${hashOrAddress}`
  }

  throw new Error('Invalid hash or address')
}
