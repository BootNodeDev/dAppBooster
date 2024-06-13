import React from 'react'
import styled from 'styled-components'

import { Text, InnerContainer as Inner, ContainerPadding } from 'db-ui-toolkit'
import { useEnsName, useAccount } from 'wagmi'
import { mainnet } from 'wagmi/chains'

import Hash from '@/src/sharedComponents/ui/Hash'
import Avatar from '@/src/sharedComponents/web3/Avatar'

const Wrapper = styled.section`
  background-color: var(--landing-page-main-background-color);
  flex-grow: 1;
`

const InnerContainer = styled(Inner)`
  flex-direction: column;

  ${ContainerPadding}
`

const Examples: React.FC = ({ ...restProps }) => {
  const { address } = useAccount()
  const { data, error, status } = useEnsName({
    address: '0x87885AaEEdED51C7e3858a782644F5d89759f245',
    chainId: mainnet.id,
  })

  return (
    <Wrapper id="examples" {...restProps}>
      <InnerContainer>
        <Text>
          {status === 'pending' ? (
            <>Loading ENS name</>
          ) : status === 'error' ? (
            <>Error fetching ENS name: {error.message}</>
          ) : (
            <>
              <b>ENS name:</b> {data}
            </>
          )}
        </Text>
        <Avatar address={address || '0x87885AaEEdED51C7e3858a782644F5d89759f245'} size={30} />
        <Hash
          explorerURL="https://etherscan.io/address/0x87885aaeeded51c7e3858a782644f5d89759f245"
          hash="0x87885aaeeded51c7e3858a782644f5d89759f245"
          onCopy={() => console.log('Copied!')}
          showCopyButton
        />
      </InnerContainer>
    </Wrapper>
  )
}

export default Examples
