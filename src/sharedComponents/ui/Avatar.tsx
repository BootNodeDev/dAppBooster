import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

interface CustomAvatarProps {
  address: string
  ensImage: string | null | undefined
  ensName: string | null | undefined
  radius?: number
  size?: number
}

/**
 * CustomAvatar component, displays an avatar with an ENS image or Jazzicon based on the provided props.
 * If an ENS image is provided, it will be displayed, otherwise a Jazzicon will be displayed based on the address.
 * This component is used as a custom avatar in the ConnectKitProvider.
 *
 * @param {string} props.address - The address
 * @param {string | null | undefined} props.ensImage - The ENS image URL for the avatar.
 * @param {string | null | undefined} props.ensName - The ENS name.
 * @param {number} [props.radius=96] - The border radius of the avatar.
 * @param {number} [props.size=96] - The size of the avatar.
 * @example <CustomAvatar address="0x1234567890abcdef1234567890abcdef12345678" ensImage="avatar.png" ensName="test.eth" radius={96} size={96} />
 */
const CustomAvatar = ({
  address,
  ensImage,
  ensName,
  radius = 96,
  size = 96,
}: CustomAvatarProps) => {
  return (
    <div
      style={{
        borderRadius: radius,
        width: size,
        height: size,
      }}
    >
      {ensImage ? (
        <img alt={ensName ?? address} height="100%" src={ensImage} width="100%" />
      ) : (
        <div data-testid="avatar-icon">
          <Jazzicon diameter={size} seed={jsNumberForAddress(address)} />
        </div>
      )}
    </div>
  )
}

export default CustomAvatar
