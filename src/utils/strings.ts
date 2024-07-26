/**
 * Truncates a string in the middle by replacing the characters between the specified start and end positions with an ellipsis.
 *
 * @param str - The string to truncate.
 * @param strPositionStart - The starting position of the string to be replaced with an ellipsis.
 * @param strPositionEnd - The ending position of the string to be replaced with an ellipsis.
 * @returns The truncated string.
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
 * This function gets a string in the form 0x12345AaEEdED51C7e3858a782644F5d897595678 and returns
 * something like 0x12345A...595678
 *
 * @param {string} hash - The hash to truncate
 * @param {number} [length=6] - The number of characters to show at the start and end of the hash. Min is 1, max is 16. Default is 6.
 */
export const getTruncatedHash = (hash: string, length: number = 6): string => {
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
