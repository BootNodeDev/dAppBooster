import { type Address } from 'viem'
import { normalize } from 'viem/ens'
import { useEnsName, useEnsAvatar } from 'wagmi'

import BaseAvatar from '@/src/sharedComponents/Avatar'

interface Props {
  address: Address
  size: number
}

/**
 * Avatar component using wagmi hooks to fetch ENS name and avatar image for the provided address.
 *
 * @param {string} props.address - The address
 * @param {number} props.size - The size of the avatar
 * @example <Avatar address="0x1234567890abcdef1234567890abcdef12345678" />
 */
const AvatarDemo = ({ address, size }: Props) => {
  const { data: ensName } = useEnsName({ address })

  const { data: avatarImg } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
  })

  return <BaseAvatar address={address} ensImage={avatarImg} ensName={ensName} size={size} />
}

export default AvatarDemo
