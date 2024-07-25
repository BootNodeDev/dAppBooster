import { type FC, type HTMLAttributes } from 'react'
import styled from 'styled-components'

import { InnerContainer as Inner, ContainerPadding } from 'db-ui-toolkit'
import { mainnet } from 'viem/chains'
import { useAccount } from 'wagmi'

import { Props as ItemProps } from '@/src/pageComponents/home/Examples/Item'
import List from '@/src/pageComponents/home/Examples/List'
import ImgAvatar from '@/src/pageComponents/home/Examples/assets/Avatar'
import ImgHash from '@/src/pageComponents/home/Examples/assets/Hash'
import GenericIcon from '@/src/pageComponents/home/Examples/assets/IPFSImage'
import ImgInputAddress from '@/src/pageComponents/home/Examples/assets/InputAddress'
import ImgSubgraph from '@/src/pageComponents/home/Examples/assets/Subgraph'
import ImgTokenInput from '@/src/pageComponents/home/Examples/assets/TokenInput'
import ImgTokenList from '@/src/pageComponents/home/Examples/assets/TokenList'
import ImgWallet from '@/src/pageComponents/home/Examples/assets/Wallet'
import Avatar from '@/src/pageComponents/home/Examples/demos/Avatar'
import { ERC20ApproveAndTransferButtonDemo } from '@/src/pageComponents/home/Examples/demos/ERC20ApproveAndTransferButton'
import EnsName from '@/src/pageComponents/home/Examples/demos/EnsName'
import Hash from '@/src/pageComponents/home/Examples/demos/Hash'
import HashInput from '@/src/pageComponents/home/Examples/demos/HashInput'
import { SignMessageDemo } from '@/src/pageComponents/home/Examples/demos/SignMessage'
import SubgraphLoader from '@/src/pageComponents/home/Examples/demos/Subgraph/SubgraphLoader'
import TokenDropdownDemo from '@/src/pageComponents/home/Examples/demos/TokenDropdown'
import TokenInput from '@/src/pageComponents/home/Examples/demos/TokenInput'
import TransactionButtonDemo from '@/src/pageComponents/home/Examples/demos/TransactionButton'
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

const Examples: FC<HTMLAttributes<HTMLElement>> = ({ ...restProps }) => {
  const { address = '0x87885AaEEdED51C7e3858a782644F5d89759f245' } = useAccount()
  const items: ItemProps[] = [
    {
      demo: <ConnectWalletButton />,
      href: 'https://github.com/BootNodeDev/dAppBooster#wallet-setup',
      icon: <ImgWallet />,
      text: 'Authenticate using an EVM Account',
      title: 'Wallet connectivity',
    },
    {
      demo: <HashInput />,
      href: 'https://github.com/BootNodeDev/dAppBooster/blob/a7d0a994f6d5c2a547513669fccb619be046f1d2/src/sharedComponents/HashInput.tsx#L25-L44',
      icon: <ImgInputAddress />,
      text: 'Validate address, ENS or transaction hash',
      title: 'Input address',
    },
    {
      demo: <TokenDropdownDemo />,
      href: 'https://github.com/BootNodeDev/dAppBooster/blob/a7d0a994f6d5c2a547513669fccb619be046f1d2/src/sharedComponents/TokenDropdown/index.tsx#L29-L37',
      icon: <ImgTokenList />,
      text: 'Dynamic token list dropdown',
      title: 'Token list',
    },
    {
      demo: <TokenInput />,
      href: 'https://github.com/BootNodeDev/dAppBooster/blob/a7d0a994f6d5c2a547513669fccb619be046f1d2/src/sharedComponents/TokenInput/index.tsx#L47-L111',
      icon: <ImgTokenInput />,
      text: 'Input with max, user balance, decimals',
      title: 'Token input',
    },
    {
      demo: <Hash chain={mainnet} hash={address} />,
      href: 'https://github.com/BootNodeDev/dAppBooster/blob/a7d0a994f6d5c2a547513669fccb619be046f1d2/src/sharedComponents/Hash.tsx#L32-L41',
      icon: <ImgHash />,
      text: 'Copy, open in explorer',
      title: 'Hash component',
    },
    {
      demo: <Avatar address={address} size={80} />,
      href: 'https://github.com/BootNodeDev/dAppBooster/blob/a7d0a994f6d5c2a547513669fccb619be046f1d2/src/sharedComponents/Avatar.tsx#L21-L33',
      icon: <ImgAvatar />,
      text: 'Address blockie avatar image',
      title: 'Avatar',
    },
    {
      demo: <SubgraphLoader />,
      href: 'https://github.com/BootNodeDev/dAppBooster#subgraphs',
      icon: <ImgSubgraph />,
      text: 'Support for connecting with subgraphs',
      title: 'Subgraph',
    },
    {
      demo: <EnsName />,
      icon: <GenericIcon />,
      text: 'Resolve ENS names',
      title: 'ENS name',
    },
    {
      demo: <TransactionButtonDemo />,
      href: 'https://github.com/BootNodeDev/dAppBooster/blob/a7d0a994f6d5c2a547513669fccb619be046f1d2/src/sharedComponents/Web3Buttons/TransactionButton.tsx#L18-L34',
      icon: <GenericIcon />,
      text: 'Transaction Button',
      title: 'Tx button',
    },
    {
      demo: <ERC20ApproveAndTransferButtonDemo />,
      href: 'https://github.com/BootNodeDev/dAppBooster/blob/a7d0a994f6d5c2a547513669fccb619be046f1d2/src/sharedComponents/Web3Buttons/ERC20ApproveAndTransferButton.tsx#L19-L35',
      icon: <GenericIcon />,
      text: 'Combines the approve and transaction button checking allowance in one button',
      title: 'Approve and Send',
    },
    {
      demo: <SignMessageDemo />,
      href: 'https://github.com/BootNodeDev/dAppBooster/blob/a7d0a994f6d5c2a547513669fccb619be046f1d2/src/sharedComponents/Web3Buttons/SignButton.tsx#L17-L38',
      icon: <GenericIcon />,
      text: 'Sign a message and get the signature',
      title: 'Sign button',
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
