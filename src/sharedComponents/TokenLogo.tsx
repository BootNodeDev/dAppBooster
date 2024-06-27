import { FC } from 'react'

import { type Token } from '@/src/token'

const getSrc = (url?: string) => {
  if (url) {
    if (url.startsWith('ipfs://')) {
      return `https://ipfs.io/ipfs/${url.split('ipfs://')[1]}`
    }
    return url
  }
  return '/appLogo.svg'
}

const TokenLogo: FC<{ token: Token }> = ({ token }) => {
  return (
    <img
      alt={token.name}
      height="24"
      onError={({ currentTarget }) => {
        currentTarget.onerror = null
        currentTarget.src = '/appLogo.svg'
      }}
      src={getSrc(token.logoURI)}
      width="24"
    />
  )
}

export default TokenLogo
