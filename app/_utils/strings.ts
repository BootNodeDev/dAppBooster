export const truncateStringInTheMiddle = (
  str: string,
  strPositionStart: number,
  strPositionEnd: number
) => {
  const minTruncatedLength = strPositionStart + strPositionEnd;
  if (minTruncatedLength < str.length) {
    return `${str.slice(0, strPositionStart)}...${str.slice(
      str.length - strPositionEnd,
      str.length
    )}`;
  }
  return str;
};

export const hexToNumber = (hex?: string) =>
  hex ? parseInt(hex || "0", 16) : null;
