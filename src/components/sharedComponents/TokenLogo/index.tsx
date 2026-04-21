import { Flex } from '@chakra-ui/react'
import { type ComponentProps, type FC, useEffect, useMemo, useState } from 'react'

import { nativeTokenIcons } from '@/src/components/sharedComponents/TokenLogo/nativeTokenIcons'
import type { ChainsIds } from '@/src/lib/networks.config'
import type { Token } from '@/src/types/token'
import { isNativeToken } from '@/src/utils/address'

interface PlaceholderProps extends ComponentProps<'div'> {
  size: number
  symbol: string
}

const generateHexColor = (symbol: string): string => {
  let hash = 0
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash)
  }

  const baseColor =
    ((hash >> 24) & 0xff).toString(16).padStart(2, '0') +
    ((hash >> 16) & 0xff).toString(16).padStart(2, '0') +
    ((hash >> 8) & 0xff).toString(16).padStart(2, '0')

  const r = Number.parseInt(baseColor.slice(0, 2), 16) % 196
  const g = Number.parseInt(baseColor.slice(2, 4), 16) % 196
  const b = Number.parseInt(baseColor.slice(4, 6), 16) % 196

  const color =
    r.toString(16).padStart(2, '0') +
    g.toString(16).padStart(2, '0') +
    b.toString(16).padStart(2, '0')

  return `#${color}`
}

const Placeholder: FC<PlaceholderProps> = ({ size, symbol, ...restProps }) => {
  const backgroundColor = useMemo(() => generateHexColor(symbol), [symbol])

  return (
    <Flex
      alignItems="center"
      backgroundColor={backgroundColor}
      borderRadius="50%"
      color="#fafafa"
      display="flex"
      fontSize="95%"
      fontWeight="700"
      height={`${size}px`}
      justifyContent="center"
      lineHeight="1"
      textTransform="uppercase"
      width={`${size}px`}
      {...restProps}
    >
      {symbol[0]}
    </Flex>
  )
}

const getSrc = (url: string) => {
  return url.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${url.split('ipfs://')[1]}` : url
}

interface TokenLogoProps {
  token: Token
  size?: number
}

/**
 * TokenLogo component, displays a token logo based on the provided token object.
 *
 * Native tokens (detected via `isNativeToken(token.address)`, a case-insensitive
 * match against `env.PUBLIC_NATIVE_TOKEN_ADDRESS`) render the chain-specific icon
 * from `@web3icons/react` when the chain is mapped in `nativeTokenIcons`. Otherwise
 * the component renders `logoURI` as an image, falling back to the colored-letter
 * Placeholder on load failure or missing URI.
 *
 * @param {TokenLogoProps} props - TokenLogo component props.
 * @param {Token} props.token - The token object to display the logo for.
 * @param {number} [props.size=24] - The size of the logo in pixels.
 *
 * @example
 * ```tsx
 * <TokenLogo
 *   token={myToken}
 *   size={32}
 * />
 * ```
 */
const TokenLogo: FC<TokenLogoProps> = ({ size = 24, token }) => {
  const { logoURI } = token
  const [hasError, setHasError] = useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: logoURI is cached and needs to be updated (this code should be refactored)
  useEffect(() => {
    setHasError(false)
  }, [logoURI])

  const NativeIcon = isNativeToken(token.address)
    ? nativeTokenIcons[token.chainId as ChainsIds]
    : undefined

  if (NativeIcon) {
    return (
      <NativeIcon
        size={size}
        variant="background"
      />
    )
  }

  return logoURI && !hasError ? (
    <img
      alt={token.name}
      height={`${size}`}
      loading="lazy"
      onError={() => setHasError(true)}
      src={getSrc(logoURI)}
      width={`${size}`}
    />
  ) : (
    <Placeholder
      size={size}
      symbol={token.symbol}
    />
  )
}

export default TokenLogo
