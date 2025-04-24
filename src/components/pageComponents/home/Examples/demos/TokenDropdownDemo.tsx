import TokenDropdown from '@/src/components/sharedComponents/TokenDropdown'
import type { Token } from '@/src/types/token'
import { type FC, useState } from 'react'

const TokenDropdownDemo: FC = ({ ...restProps }) => {
  const [currentToken, setCurrentToken] = useState<Token>()

  const onTokenSelect = (token: Token | undefined) => {
    setCurrentToken(token)
  }

  return (
    <TokenDropdown
      currentToken={currentToken}
      onTokenSelect={onTokenSelect}
      {...restProps}
    />
  )
}

export default TokenDropdownDemo
