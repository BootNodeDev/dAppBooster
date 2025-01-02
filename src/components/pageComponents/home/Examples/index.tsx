import type { FC, HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

import {
  ContainerPadding,
  InnerContainer as Inner,
  breakpointMediaQuery,
} from '@bootnodedev/db-ui-toolkit'

import type { Props as ItemProps } from '@/src/components/pageComponents/home/Examples/Item'
import List from '@/src/components/pageComponents/home/Examples/List'
import ImgEns from '@/src/components/pageComponents/home/Examples/assets/Ens'
import ImgInputAddress from '@/src/components/pageComponents/home/Examples/assets/InputAddress'
import OptimismIcon from '@/src/components/pageComponents/home/Examples/assets/Optimism'
import ImgSign from '@/src/components/pageComponents/home/Examples/assets/Sign'
import ImgSubgraph from '@/src/components/pageComponents/home/Examples/assets/Subgraph'
import ImgSubgraphStatus from '@/src/components/pageComponents/home/Examples/assets/SubgraphStatus'
import ImgSwitch from '@/src/components/pageComponents/home/Examples/assets/Switch'
import ImgTokenInput from '@/src/components/pageComponents/home/Examples/assets/TokenInput'
import ImgTokenList from '@/src/components/pageComponents/home/Examples/assets/TokenList'
import ImgTransaction from '@/src/components/pageComponents/home/Examples/assets/Transaction'
import ImgWallet from '@/src/components/pageComponents/home/Examples/assets/Wallet'
import EnsNameDemo from '@/src/components/pageComponents/home/Examples/demos/EnsNameDemo'
import HashHandlingDemo from '@/src/components/pageComponents/home/Examples/demos/HashHandlingDemo'
import OptimismCrossDomainMessenger from '@/src/components/pageComponents/home/Examples/demos/OptimismCrossDomainMessenger'
import SignMessageDemo from '@/src/components/pageComponents/home/Examples/demos/SignMessageDemo'
import SubgraphDemo from '@/src/components/pageComponents/home/Examples/demos/SubgraphDemo'
import SubgraphStatusDemo from '@/src/components/pageComponents/home/Examples/demos/SubgraphStatusDemo'
import SwitchNetworkDemo from '@/src/components/pageComponents/home/Examples/demos/SwitchNetworkDemo'
import TokenDropdownDemo from '@/src/components/pageComponents/home/Examples/demos/TokenDropdownDemo'
import TokenInputDemo from '@/src/components/pageComponents/home/Examples/demos/TokenInputDemo'
import TransactionButtonDemo from '@/src/components/pageComponents/home/Examples/demos/TransactionButtonDemo'
import { ConnectWalletButton as ConnectWalletButtonDemo } from '@/src/providers/Web3Provider'

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
  padding-bottom: 50px;
  padding-top: 50px;

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      padding-bottom: 100px;
      padding-top: 100px;
    `,
  )}

  ${ContainerPadding}
`

const Examples: FC<HTMLAttributes<HTMLElement>> = ({ ...restProps }) => {
  const items: ItemProps[] = [
    {
      demo: <ConnectWalletButtonDemo />,
      href: 'https://bootnodedev.github.io/dAppBooster/functions/components_sharedComponents_ConnectButton.ConnectButton.html',
      icon: <ImgWallet />,
      sourceCodeHref:
        'https://github.com/BootNodeDev/dAppBoosterLandingPage/blob/a524d9d65069652de1d187514cc8d635c2d075fd/src/lib/wallets/connectkit.config.tsx',
      text: (
        <>
          Connect to and disconnect from a cryptocurrency wallet, display your{' '}
          <a
            href="https://bootnodedev.github.io/dAppBooster/functions/components_sharedComponents_Avatar.Avatar.html"
            rel="noreferrer"
            target="_blank"
          >
            avatar
          </a>{' '}
          and address.
        </>
      ),
      title: 'Wallet connectivity',
    },
    {
      demo: <HashHandlingDemo />,
      href: 'https://bootnodedev.github.io/dAppBooster/functions/components_sharedComponents_Hash.Hash.html',
      icon: <ImgInputAddress />,
      sourceCodeHref:
        'https://github.com/BootNodeDev/dAppBoosterLandingPage/blob/f75be6325de83cfef9753bb29f10f8b6e4679cca/src/components/pageComponents/home/Examples/demos/HashHandlingDemo.tsx#L155',
      text: (
        <>
          Validate an address or hash. Copy or open it in the block explorer for the chain your
          wallet is connected to (defaults to mainnet).
        </>
      ),
      title: 'Hash handling',
    },
    {
      demo: <TokenDropdownDemo />,
      href: 'https://bootnodedev.github.io/dAppBooster/functions/components_sharedComponents_TokenDropdown.TokenDropdown.html',
      icon: <ImgTokenList />,
      sourceCodeHref:
        'https://github.com/BootNodeDev/dAppBoosterLandingPage/blob/f75be6325de83cfef9753bb29f10f8b6e4679cca/src/components/pageComponents/home/Examples/demos/TokenDropdownDemo.tsx#L13',
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
    },
    {
      demo: <TokenInputDemo />,
      sourceCodeHref:
        'https://github.com/BootNodeDev/dAppBoosterLandingPage/blob/f75be6325de83cfef9753bb29f10f8b6e4679cca/src/components/pageComponents/home/Examples/demos/TokenInputDemo.tsx#L38',
      href: 'https://bootnodedev.github.io/dAppBooster/functions/components_sharedComponents_TokenInput.TokenInput.html',
      icon: <ImgTokenInput />,
      text: (
        <>
          <a
            href="https://bootnodedev.github.io/dAppBooster/variables/sharedComponents_TokenSelect.TokenSelect.html"
            rel="noreferrer"
            target="_blank"
          >
            Select a token
          </a>{' '}
          or specify one beforehand, enter a token amount, auto detect token decimals, user balance,
          min and max boundaries, format numbers, max button.
        </>
      ),
      title: 'Token input',
    },
    {
      demo: <SwitchNetworkDemo />,
      sourceCodeHref:
        'https://github.com/BootNodeDev/dAppBoosterLandingPage/blob/dac8165b48832fae2fda82ad5e334f972e187d10/src/components/pageComponents/home/Examples/demos/SwitchNetworkDemo.tsx#L11',
      href: 'https://bootnodedev.github.io/dAppBooster/functions/components_sharedComponents_SwitchNetwork.SwitchNetwork.html',
      icon: <ImgSwitch />,
      text: 'Learn how to add or switch networks in supported wallets.',
      title: 'Add / switch network',
    },

    {
      sourceCodeHref:
        'https://github.com/BootNodeDev/dAppBoosterLandingPage/blob/dac8165b48832fae2fda82ad5e334f972e187d10/src/components/pageComponents/home/Examples/demos/SubgraphDemo/List.tsx#L249',
      demo: <SubgraphDemo />,
      href: 'https://docs.dappbooster.dev/plugins/subgraphs',
      icon: <ImgSubgraph />,
      text: 'Connect to subgraphs and fetch data from the blockchain the easy way.',
      title: 'Subgraphs',
    },
    {
      sourceCodeHref:
        'https://github.com/BootNodeDev/dAppBoosterLandingPage/blob/dac8165b48832fae2fda82ad5e334f972e187d10/src/components/pageComponents/home/Examples/demos/SubgraphStatusDemo/List.tsx#L178',
      demo: <SubgraphStatusDemo />,
      href: 'https://docs.dappbooster.dev/plugins/subgraphs',
      icon: <ImgSubgraphStatus />,
      text: "Easily check a subgraph's syncing status.",
      title: 'Subgraph status',
    },
    {
      sourceCodeHref:
        'https://github.com/BootNodeDev/dAppBoosterLandingPage/blob/dac8165b48832fae2fda82ad5e334f972e187d10/src/components/pageComponents/home/Examples/demos/EnsNameDemo.tsx#L101',
      demo: <EnsNameDemo />,
      icon: <ImgEns />,
      text: (
        <>
          Resolve{' '}
          <a
            href="https://ens.domains/"
            rel="noreferrer"
            target="_blank"
          >
            ENS
          </a>{' '}
          names to their corresponding addresses.
        </>
      ),
      title: 'ENS name',
    },
    {
      sourceCodeHref:
        'https://github.com/BootNodeDev/dAppBoosterLandingPage/blob/dac8165b48832fae2fda82ad5e334f972e187d10/src/components/pageComponents/home/Examples/demos/TransactionButtonDemo/index.tsx#L29',
      demo: <TransactionButtonDemo />,
      href: 'https://bootnodedev.github.io/dAppBooster/functions/components_sharedComponents_TransactionButton.TransactionButton.html',
      icon: <ImgTransaction />,
      text: (
        <>
          Transfer native cryptocurrency to your own address, or check ERC20 allowance, approve
          ERC20 use, and execute a demo transaction.
        </>
      ),
      title: 'Transaction button',
    },
    {
      sourceCodeHref:
        'https://github.com/BootNodeDev/dAppBoosterLandingPage/blob/dac8165b48832fae2fda82ad5e334f972e187d10/src/components/pageComponents/home/Examples/demos/SignMessageDemo.tsx#L37',
      demo: <SignMessageDemo />,
      href: 'https://bootnodedev.github.io/dAppBooster/functions/components_sharedComponents_SignButton.SignButton.html',
      icon: <ImgSign />,
      text: 'Sign a message with your wallet and get the signature on a dialog.',
      title: 'Sign button',
    },
    {
      sourceCodeHref:
        'https://github.com/BootNodeDev/dAppBooster/blob/main/src/hooks/useL1CrossDomainMessengerProxy.ts',
      demo: <OptimismCrossDomainMessenger />,
      href: 'https://bootnodedev.github.io/dAppBooster/functions/hooks_useL1CrossDomainMessengerProxy.useL1CrossDomainMessengerProxy.html',
      icon: <OptimismIcon />,
      text: (
        <>
          Learn more in{' '}
          <a
            href="https://docs.optimism.io/builders/app-developers/bridging/messaging"
            rel="noreferrer"
            target="_blank"
          >
            Optimism cross domain messenger.
          </a>
        </>
      ),
      title: 'Optimism cross domain messenger',
    },
  ]

  return (
    <Wrapper
      id="examples"
      {...restProps}
    >
      <InnerContainer>
        <List items={items} />
      </InnerContainer>
    </Wrapper>
  )
}

export default Examples
