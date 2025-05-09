import { type Address, type Chain, type Hash, isAddress, isHash } from 'viem'

export type GetExplorerUrlParams = {
  chain: Chain
  hashOrAddress: Hash | Address
  explorerUrl?: string
}

/**
 * Returns the explorer link for a given chain, hash or address.
 *
 * Generates a blockchain explorer URL based on the provided parameters. The function
 * determines whether the input is an address or transaction hash and constructs
 * the appropriate URL path.
 *
 * @param {GetExplorerUrlParams} params - The parameters for generating the explorer link
 * @param {Chain} params.chain - The blockchain chain object containing explorer information
 * @param {Hash | Address} params.hashOrAddress - The transaction hash or wallet address to explore
 * @param {string} [params.explorerUrl] - Optional custom explorer URL to override the chain's default explorer
 *
 * @throws {Error} Throws an error if the provided hash or address is invalid
 *
 * @returns {string} The complete explorer URL for the given hash or address
 *
 * @example
 * ```tsx
 * const addressLink = getExplorerLink({
 *   chain: mainnet,
 *   hashOrAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
 * });
 * // Returns: "https://etherscan.io/address/0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
 * ```
 *
 * @example
 * ```tsx
 * // Get link for a transaction hash with custom explorer
 * const txLink = getExplorerLink({
 *   chain: optimism,
 *   hashOrAddress: '0x123...abc',
 *   explorerUrl: 'https://optimistic.etherscan.io'
 * });
 * // Returns: "https://optimistic.etherscan.io/tx/0x123...abc"
 * ```
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
      : `${chain.blockExplorers?.default.url}/tx/${hashOrAddress}`
  }

  throw new Error('Invalid hash or address')
}
