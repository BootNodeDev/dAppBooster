import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

interface CustomAvatarProps {
  address: string
  ensImage: string | null | undefined
  ensName: string | null | undefined
  radius?: number
  size?: number
}

const CustomAvatar = ({
  address,
  ensImage,
  ensName,
  radius = 96, // 100 minus 4px border
  size = 96, // 100 minus 4px border
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
