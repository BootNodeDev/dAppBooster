import { Address } from 'viem'
import { normalize } from 'viem/ens'
import { useEnsName, useEnsAvatar } from 'wagmi'

import CustomAvatar from '@/src/sharedComponents/ui/Avatar'

const Avatar = ({ address }: { address: Address }) => {
  const { data: ensName } = useEnsName({ address })

  const { data: avatarImg } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
  })

  return <CustomAvatar address={address} ensImage={avatarImg} ensName={ensName} size={50} />
}

export default Avatar
