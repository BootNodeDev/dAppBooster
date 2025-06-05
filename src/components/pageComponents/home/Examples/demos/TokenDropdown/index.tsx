import Icon from '@/src/components/pageComponents/home/Examples/demos/TokenDropdown/Icon'
import Wrapper from '@/src/components/pageComponents/home/Examples/wrapper'
import BaseTokenDropdown from '@/src/components/sharedComponents/TokenDropdown'
import type { Token } from '@/src/types/token'
import { type FC, useState } from 'react'

const TokenDropdown: FC = ({ ...restProps }) => {
  const [currentToken, setCurrentToken] = useState<Token>()

  const onTokenSelect = (token: Token | undefined) => {
    setCurrentToken(token)
  }

  return (
    <Wrapper title="Search and select a token">
      <p>This component enables users to quickly find and choose a token from a predefined list.</p>
      <BaseTokenDropdown
        currentToken={currentToken}
        onTokenSelect={onTokenSelect}
        {...restProps}
      />
    </Wrapper>
  )
}

const tokenDropdown = {
  demo: <TokenDropdown />,
  href: 'https://bootnodedev.github.io/dAppBooster/variables/components_sharedComponents_TokenDropdown.TokenDropdown.html',
  icon: <Icon />,
  text: (
    <>
      Allows you to search or select tokens from a list. Uses our{' '}
      <a
        href="https://bootnodedev.github.io/dAppBooster/variables/components_sharedComponents_TokenSelect.TokenSelect.html"
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
