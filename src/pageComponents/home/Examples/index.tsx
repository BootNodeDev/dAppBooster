import React from 'react'
import styled from 'styled-components'

import { InnerContainer as Inner, ContainerPadding } from 'db-ui-toolkit'
import { mainnet } from 'viem/chains'
import { useAccount } from 'wagmi'

import { Props as ItemProps } from '@/src/pageComponents/home/Examples/Item'
import List from '@/src/pageComponents/home/Examples/List'
import ImgAvatar from '@/src/pageComponents/home/Examples/assets/Avatar'
import ImgHash from '@/src/pageComponents/home/Examples/assets/Hash'
import ImgIpfsImage from '@/src/pageComponents/home/Examples/assets/IPFSImage'
import ImgInputAddress from '@/src/pageComponents/home/Examples/assets/InputAddress'
import ImgSubgraph from '@/src/pageComponents/home/Examples/assets/Subgraph'
import ImgTokenInput from '@/src/pageComponents/home/Examples/assets/TokenInput'
import ImgTokenList from '@/src/pageComponents/home/Examples/assets/TokenList'
import ImgWallet from '@/src/pageComponents/home/Examples/assets/Wallet'
import AmountSelector from '@/src/pageComponents/home/Examples/demos/AmountSelector'
import Avatar from '@/src/pageComponents/home/Examples/demos/Avatar'
import EnsName from '@/src/pageComponents/home/Examples/demos/EnsName'
import Hash from '@/src/pageComponents/home/Examples/demos/Hash'
import HashInput from '@/src/pageComponents/home/Examples/demos/HashInput'
import TokenDropdown from '@/src/pageComponents/home/Examples/demos/TokenDropdown'
import { TransactionButtonDemo } from '@/src/pageComponents/home/Examples/demos/TransactionButton'
import { ConnectWalletButton } from '@/src/providers/Web3Provider'

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
  const items: ItemProps[] = [
    {
      demo: <ConnectWalletButton />,
      href: '#',
      icon: <ImgWallet />,
      text: 'Authenticate using an OP Account',
      title: 'Wallet connectivity',
    },
    {
      demo: <HashInput />,
      href: '#',
      icon: <ImgInputAddress />,
      text: 'Validate address, ENS or transaction hash',
      title: 'Input address',
    },
    {
      demo: <TokenDropdown />,
      href: '#',
      icon: <ImgTokenList />,
      text: 'Dynamic token list dropdown',
      title: 'Token list',
    },
    {
      demo: <AmountSelector />,
      href: '#',
      icon: <ImgTokenInput />,
      text: 'Input with max, user balance, decimals',
      title: 'Token input',
    },
    {
      demo: <Hash chain={mainnet} hash={address} />,
      href: '#',
      icon: <ImgHash />,
      text: 'Copy, open in explorer',
      title: 'Hash component',
    },
    {
      demo: <Avatar address={address} size={80} />,
      href: '#',
      icon: <ImgAvatar />,
      text: 'Address blockie avatar image',
      title: 'Avatar',
    },
    {
      demo: <div>Subgraph</div>,
      href: '#',
      icon: <ImgSubgraph />,
      text: 'Support for connecting with subgraphs',
      title: 'Subgraph',
    },
    {
      demo: <div>IPFS Image</div>,
      href: '#',
      icon: <ImgIpfsImage />,
      text: 'Immutable and decentralized file storage',
      title: 'Image IPFS',
    },
    {
      demo: <EnsName address={address} />,
      href: '#',
      icon: <ImgIpfsImage />,
      text: 'Resolve ENS names',
      title: 'ENS name',
    },
    {
      demo: <TransactionButtonDemo />,
      href: '#',
      icon: <ImgIpfsImage />,
      text: 'Transaction Button',
      title: 'Tx button',
    },
  ]

  return (
    <Wrapper id="examples" {...restProps}>
      <InnerContainer>
        <List items={items} />
      </InnerContainer>
    </Wrapper>
  )
}

export default Examples
