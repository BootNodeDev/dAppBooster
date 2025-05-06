import Icon from '@/src/components/pageComponents/home/Examples/demos/ConnectWallet/Icon'
import { ConnectWalletButton } from '@/src/providers/Web3Provider'

const connectWallet = {
  demo: <ConnectWalletButton />,
  href: 'https://bootnodedev.github.io/dAppBooster/functions/components_sharedComponents_ConnectButton.ConnectButton.html',
  icon: <Icon />,
  sourceCodeHref:
    'https://github.com/BootNodeDev/dAppBooster/blob/a524d9d65069652de1d187514cc8d635c2d075fd/src/lib/wallets/connectkit.config.tsx',
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
}

export default connectWallet
