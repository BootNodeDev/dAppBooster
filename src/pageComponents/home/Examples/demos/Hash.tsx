import { Address, Chain } from 'viem'

import BaseHash from '@/src/sharedComponents/Hash'
import { getExplorerLink } from '@/src/utils/getExplorerLink'

interface Props {
  hash: Address
  chain: Chain
}

const Hash = ({ chain, hash }: Props) => {
  return (
    <BaseHash
      explorerURL={getExplorerLink({ chain, hashOrAddress: hash })}
      hash={hash}
      onCopy={() => console.log('Copied!')}
      showCopyButton
    />
  )
}

export default Hash
