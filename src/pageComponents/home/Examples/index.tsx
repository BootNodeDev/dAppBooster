import React from 'react'
import styled from 'styled-components'

import { InnerContainer as Inner, ContainerPadding } from 'db-ui-toolkit'
import { useAccount } from 'wagmi'

import Avatar from '@/src/pageComponents/home/Examples/Items/Avatar'
import BigNumberInput from '@/src/pageComponents/home/Examples/Items/BigNumberInput'
import EnsName from '@/src/pageComponents/home/Examples/Items/EnsName'
import Hash from '@/src/pageComponents/home/Examples/Items/Hash'

const Wrapper = styled.section`
  [data-theme='light'] & {
    --landing-page-main-background-color: #f7f7f7;
  }

  [data-theme='dark'] & {
    --landing-page-main-background-color: #2e3048;
  }

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
        <EnsName address={address} />
        <Hash hash={address} />
        <Avatar address={address} size={30} />
        <BigNumberInput />
      </InnerContainer>
    </Wrapper>
  )
}

export default Examples
