import { env } from '@/src/env'

/**
 * Checks if the given address is the native token address according to the current environment.
 *
 * @param {string} address - The address to check.
 * @returns True if the address is the native token address, false otherwise.
 */
export const isNativeToken = (address: string) => {
  return address === env.PUBLIC_NATIVE_TOKEN_ADDRESS
}
