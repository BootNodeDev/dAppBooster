import { type ComponentProps, type FC, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import type { Token } from '@/src/types/token'

interface PlaceholderProps extends ComponentProps<'div'> {
  size: number
  symbol: string
}

const Wrapper = styled.div<{ $size: number; $backgroundColor: string }>`
  align-items: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: 50%;
  color: #fafafa;
  display: flex;
  font-size: 95%;
  font-weight: 700;
  height: ${({ $size }) => $size}px;
  justify-content: center;
  line-height: 1;
  text-transform: uppercase;
  width: ${({ $size }) => $size}px;
`

const Placeholder: FC<PlaceholderProps> = ({ size, symbol, ...restProps }) => {
  const [backgroundColor, setBackgroundColor] = useState<string>('')

  const generateHexColor = useCallback((symbol: string): string => {
    // Convert symbol to a hash number
    let hash = 0
    for (let i = 0; i < symbol.length; i++) {
      hash = symbol.charCodeAt(i) + ((hash << 5) - hash)
    }

    // Convert hash to a hexadecimal string and ensure it is 6 characters long
    const baseColor =
      ((hash >> 24) & 0xff).toString(16).padStart(2, '0') +
      ((hash >> 16) & 0xff).toString(16).padStart(2, '0') +
      ((hash >> 8) & 0xff).toString(16).padStart(2, '0')

    // Ensure the baseColor is dark-ish by making sure each component is less than 196
    const r = Number.parseInt(baseColor.slice(0, 2), 16) % 196
    const g = Number.parseInt(baseColor.slice(2, 4), 16) % 196
    const b = Number.parseInt(baseColor.slice(4, 6), 16) % 196

    // Convert back to hex string and pad with leading 6s if necessary and also
    // because I love Satan
    const color =
      r.toString(16).padStart(2, '6') +
      g.toString(16).padStart(2, '6') +
      b.toString(16).padStart(2, '6')

    return `#${color}`
  }, [])

  useEffect(() => {
    setBackgroundColor(generateHexColor(symbol))
  }, [symbol, generateHexColor])

  return (
    <Wrapper
      $backgroundColor={backgroundColor}
      $size={size}
      {...restProps}
    >
      {symbol[0]}
    </Wrapper>
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
 * @param {TokenLogoProps} props - TokenLogo component props.
 * @param {Token} props.token - The token object to display the logo for.
 * @param {number} [props.size=24] - The size of the logo.
 *
 * @example
 * ```tsx
 * <TokenLogo
 *    token={myToken}
 * />
 * ```
 */
const TokenLogo: FC<TokenLogoProps> = ({ size = 24, token }) => {
  const { logoURI } = token
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [])

  return logoURI && !hasError ? (
    <img
      alt={token.name}
      height={`${size}`}
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
