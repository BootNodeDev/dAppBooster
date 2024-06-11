import { Address } from 'viem'
import { normalize } from 'viem/ens'
import { useEnsName, useEnsAvatar } from 'wagmi'

import CustomAvatar from '@/src/sharedComponents/ui/Avatar'

interface AvatarProps {
  address: Address
}

/**
 * Avatar WEB3 component using wagmi hooks to fetch ENS name and avatar image for the provided address.
 *
 * @param {string} props.address - The address
 * @example <Avatar address="0x1234567890abcdef1234567890abcdef12345678" />
 */
const Avatar = ({ address }: AvatarProps) => {
  const { data: ensName } = useEnsName({ address })

  const { data: avatarImg } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
  })

  return <CustomAvatar address={address} ensImage={avatarImg} ensName={ensName} size={50} />
}

export default Avatar
