import { type FC, type ComponentProps } from 'react'
import styled from 'styled-components'

import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

const ImageWrapper = styled.div<{
  size: number
}>`
  border-radius: 50%;
  height: ${(props) => `${props.size}px`};
  overflow: hidden;
  width: ${(props) => `${props.size}px`};
`

interface AvatarProps extends ComponentProps<'div'> {
  address: string
  ensImage: string | null | undefined
  ensName: string | null | undefined
  size?: number
}

/**
 * Avatar component, displays an avatar with an ENS image or Jazzicon based on the provided props.
 *
 * If an ENS image is provided, it will be displayed, otherwise a Jazzicon will be displayed based on the address.
 * This component is used as a custom avatar for the WalletProvider.
 *
 * @param {object} props - Avatar component props.
 * @param {string} props.address - The address to infer the avatar from
 * @param {string | null | undefined} props.ensImage - The ENS image URL for the avatar
 * @param {string | null | undefined} props.ensName - The ENS name
 * @param {number} [props.size=100] - The size of the avatar
 *
 * @example
 * ```tsx
 * <Avatar
 *    address="0x1234567890abcdef1234567890abcdef12345678"
 *    ensImage="avatar.png"
 *    ensName="test.eth"
 *    radius={96}
 *    size={96}
 * />
 * ```
 */

const Avatar: FC<AvatarProps> = ({ address, ensImage, ensName, size = 100 }) => {
  return (
    <ImageWrapper size={size}>
      {ensImage ? (
        <img alt={ensName ?? address} height="100%" src={ensImage} width="100%" />
      ) : (
        <Jazzicon data-testid="avatar-icon" diameter={size} seed={jsNumberForAddress(address)} />
      )}
    </ImageWrapper>
  )
}

export default Avatar
