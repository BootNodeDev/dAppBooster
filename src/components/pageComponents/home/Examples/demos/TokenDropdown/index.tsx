import Icon from '@/src/components/pageComponents/home/Examples/demos/TokenDropdown/Icon'
import BaseTokenDropdown from '@/src/components/sharedComponents/TokenDropdown'
import type { Token } from '@/src/types/token'
import { type FC, useState } from 'react'

const TokenDropdown: FC = ({ ...restProps }) => {
  const [currentToken, setCurrentToken] = useState<Token>()

  const onTokenSelect = (token: Token | undefined) => {
    setCurrentToken(token)
  }

  return (
    <BaseTokenDropdown
      currentToken={currentToken}
      onTokenSelect={onTokenSelect}
      {...restProps}
    />
  )
}

const tokenDropdown = {
  demo: <TokenDropdown />,
  href: 'https://bootnodedev.github.io/dAppBooster/functions/components_sharedComponents_TokenDropdown.TokenDropdown.html',
  icon: <Icon />,
  sourceCodeHref:
    'https://github.com/BootNodeDev/dAppBooster/blob/f75be6325de83cfef9753bb29f10f8b6e4679cca/src/components/pageComponents/home/Examples/demos/TokenDropdownDemo.tsx#L13',
  text: (
    <>
      Allows you to search or select tokens from a list. Uses our{' '}
      <a
        href="https://bootnodedev.github.io/dAppBooster/variables/sharedComponents_TokenSelect.TokenSelect.html"
        rel="noreferrer"
        target="_blank"
      >
        TokenSelect
      </a>{' '}
      component internally.
    </>
  ),
  title: 'Token dropdown',
}

export default tokenDropdown
