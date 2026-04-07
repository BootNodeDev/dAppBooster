import { env } from '@/src/env'

/**
 * Checks if the given address matches the native token address.
 *
 * The function compares the lowercase version of the input address with
 * the native token address defined in the environment configuration.
 *
 * @param {string} address - The blockchain address to check
 * @returns {boolean} Returns true if the address matches the native token address, false otherwise
 *
 * @example
 * ```tsx
 * // Example using Ethereum's native token address
 * const isNative = isNativeToken('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE');
 * console.log(isNative); // true or false depending on environment configuration
 * ```
 */
export const isNativeToken = (address: string) => {
  return address.toLowerCase() === env.PUBLIC_NATIVE_TOKEN_ADDRESS
}
