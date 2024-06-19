import React from 'react'
import styled from 'styled-components'

import { InnerContainer as Inner, ContainerPadding } from 'db-ui-toolkit'
import { useAccount } from 'wagmi'

import List from '@/src/pageComponents/home/Examples/List'
import Avatar from '@/src/pageComponents/home/Examples/demos/Avatar'
import BigNumberInput from '@/src/pageComponents/home/Examples/demos/BigNumberInput'
import EnsName from '@/src/pageComponents/home/Examples/demos/EnsName'
import Hash from '@/src/pageComponents/home/Examples/demos/Hash'

const Wrapper = styled.section`
  background-color: var(--landing-page-main-background-color);
  flex-grow: 1;
`

const InnerContainer = styled(Inner)`
  align-items: center;
  flex-direction: column;
  padding-bottom: 100px;
  padding-top: 100px;

  ${ContainerPadding}
`

const Examples: React.FC = ({ ...restProps }) => {
  const { address = '0x87885AaEEdED51C7e3858a782644F5d89759f245' } = useAccount()

  return (
    <Wrapper id="examples" {...restProps}>
      <InnerContainer>
        <List>
          <EnsName address={address} />
          <Hash hash={address} />
          <Avatar address={address} size={30} />
          <BigNumberInput />
        </List>
      </InnerContainer>
    </Wrapper>
  )
}

export default Examples
