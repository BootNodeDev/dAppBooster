import { Box } from '@chakra-ui/react'
import type { ComponentProps, FC } from 'react'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

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
const Avatar: FC<AvatarProps> = ({
  address,
  ensImage,
  ensName,
  size = 100,
}: {
  address: string
  ensImage: string | null | undefined
  ensName: string | null | undefined
  size?: number
}) => {
  return (
    <Box
      borderRadius="50%"
      height={`${size}px`}
      overflow="hidden"
      width={`${size}px`}
    >
      {ensImage ? (
        <img
          alt={ensName ?? address}
          height="100%"
          src={ensImage}
          width="100%"
        />
      ) : (
        <Jazzicon
          data-testid="avatar-icon"
          diameter={size}
          seed={jsNumberForAddress(address)}
        />
      )}
    </Box>
  )
}

export default Avatar
