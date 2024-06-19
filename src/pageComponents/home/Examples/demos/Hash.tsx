import { Address } from 'viem'

import BaseHash from '@/src/sharedComponents/Hash'

interface Props {
  hash: Address
}

const Hash = ({ hash }: Props) => {
  return (
    <BaseHash
      explorerURL={`https://etherscan.io/address/${hash}`}
      hash={hash}
      onCopy={() => console.log('Copied!')}
      showCopyButton
    />
  )
}

export default Hash
