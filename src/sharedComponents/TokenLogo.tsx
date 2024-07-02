import { FC } from 'react'

import { type Token } from '@/src/types/token'

const getSrc = (url?: string) => {
  if (url) {
    if (url.startsWith('ipfs://')) {
      return `https://ipfs.io/ipfs/${url.split('ipfs://')[1]}`
    }
    return url
  }
  return '/appLogo.svg'
}

const defaultToken: Token = { address: '', chainId: 0, decimals: 0, name: '', symbol: '' }

const TokenLogo: FC<{ token?: Token; size?: number }> = ({ size = 24, token = defaultToken }) => {
  return (
    <img
      alt={token.name}
      height={`${size}`}
      onError={({ currentTarget }) => {
        currentTarget.onerror = null
        currentTarget.src = '/appLogo.svg'
      }}
      src={getSrc(token.logoURI)}
      width={`${size}`}
    />
  )
}

export default TokenLogo
