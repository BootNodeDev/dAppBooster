import { OptionsDropdown } from '@/src/components/pageComponents/home/Examples/demos/OptionsDropdown'
import ERC20ApproveAndTransferButtonDemo from '@/src/components/pageComponents/home/Examples/demos/TransactionButtonDemo/ERC20ApproveAndTransferButtonDemo'
import NativeTokenDemo from '@/src/components/pageComponents/home/Examples/demos/TransactionButtonDemo/NativeTokenDemo'
import { WalletStatusVerifier } from '@/src/components/sharedComponents/WalletStatusVerifier'
import { breakpointMediaQuery } from '@bootnodedev/db-ui-toolkit'
import { useState } from 'react'
import styled, { css } from 'styled-components'
import { sepolia } from 'viem/chains'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: var(--base-common-padding);
  width: 100%;

  ${breakpointMediaQuery(
    'desktopStart',
    css`
      padding-top: calc(var(--base-common-padding) * 3);
    `,
  )}
`

type Options = 'erc20' | 'native'

const TransactionButtonDemo = () => {
  const [currentTokenInput, setCurrentTokenInput] = useState<Options>('erc20')
  const items = [
    { label: 'ERC20 token (USDC)', onClick: () => setCurrentTokenInput('erc20') },
    { label: 'ETH (Native)', onClick: () => setCurrentTokenInput('native') },
  ]

  return (
    <WalletStatusVerifier chainId={sepolia.id}>
      <Wrapper>
        <OptionsDropdown items={items} />
        {currentTokenInput === 'erc20' && <ERC20ApproveAndTransferButtonDemo />}
        {currentTokenInput === 'native' && <NativeTokenDemo />}
      </Wrapper>
    </WalletStatusVerifier>
  )
}

export default TransactionButtonDemo
