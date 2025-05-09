/**
 * Truncates a string in the middle by replacing the middle portion with an ellipsis.
 *
 * This function preserves the beginning and ending portions of the string while replacing
 * the middle section with "..." when the string exceeds a certain length.
 *
 * @param {string} str - The original string to truncate
 * @param {number} strPositionStart - Number of characters to preserve from the beginning
 * @param {number} strPositionEnd - Number of characters to preserve from the end
 * @returns {string} The truncated string or the original if no truncation is needed
 *
 * @example
 * ```tsx
 * // Truncate an Ethereum address
 * truncateStringInTheMiddle("0x1234567890abcdef1234567890abcdef12345678", 8, 6);
 * // Returns: "0x123456...345678"
 * ```
 */
export const truncateStringInTheMiddle = (
  str: string,
  strPositionStart: number,
  strPositionEnd: number,
): string => {
  const minTruncatedLength = strPositionStart + strPositionEnd

  if (minTruncatedLength < str.length) {
    return `${str.slice(0, strPositionStart)}...${str.slice(
      str.length - strPositionEnd,
      str.length,
    )}`
  }

  return str
}

/**
 * Truncates a hash string (like an Ethereum address or transaction hash) by preserving the beginning and end.
 *
 * This function is specifically designed for blockchain-related hash values with the "0x" prefix,
 * automatically preserving the prefix in addition to the specified number of characters.
 *
 * @param {string} hash - The hash string to truncate (typically starts with "0x")
 * @param {number} [length=6] - The number of characters to preserve at both start and end
 *   (min: 1, max: 16, excluding the "0x" prefix)
 * @returns {string} The truncated hash with ellipsis in the middle
 *
 * @example
 * ```tsx
 * // Truncate an Ethereum address with default length
 * getTruncatedHash("0x1234567890abcdef1234567890abcdef12345678");
 * // Returns: "0x123456...345678"
 * ```
 *
 * @example
 * ```tsx
 * // Truncate with custom length
 * getTruncatedHash("0x1234567890abcdef1234567890abcdef12345678", 4);
 * // Returns: "0x1234...5678"
 * ```
 *
 * @example
 * ```tsx
 * // Truncate with maximum length
 * getTruncatedHash("0x1234567890abcdef1234567890abcdef12345678", 16);
 * // Uses maximum of 16: "0x1234567890abcdef...1234567890abcdef"
 * ```
 */
export const getTruncatedHash = (hash: string, length = 6): string => {
  const sanitizeLength = (length: number): number => {
    // min and max are arbitrary reasonable values, just to make sure the length is not too short or too long
    const min = 1
    const max = 16

    return length < min ? min : length > max ? max : length
  }

  const sanitizedLength = sanitizeLength(length)

  // Initial length = length + 2 because of the 0x prefix
  return `${hash.slice(0, sanitizedLength + 2)}...${hash.slice(hash.length - sanitizedLength, hash.length)}`
}
