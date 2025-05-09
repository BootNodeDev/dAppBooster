import { OptionsDropdown } from '@/src/components/pageComponents/home/Examples/demos/OptionsDropdown'
import ERC20ApproveAndTransferButton from '@/src/components/pageComponents/home/Examples/demos/TransactionButton/ERC20ApproveAndTransferButton'
import Icon from '@/src/components/pageComponents/home/Examples/demos/TransactionButton/Icon'
import NativeToken from '@/src/components/pageComponents/home/Examples/demos/TransactionButton/NativeToken'
import { WalletStatusVerifier } from '@/src/components/sharedComponents/WalletStatusVerifier'
import { Flex } from '@chakra-ui/react'
import { useState } from 'react'
import { sepolia } from 'wagmi/chains'

type Options = 'erc20' | 'native'

const TransactionButton = () => {
  const [currentTokenInput, setCurrentTokenInput] = useState<Options>('erc20')
  const items = [
    { label: 'ERC20 token (USDC)', onClick: () => setCurrentTokenInput('erc20') },
    { label: 'ETH (Native)', onClick: () => setCurrentTokenInput('native') },
  ]

  return (
    <WalletStatusVerifier chainId={sepolia.id}>
      <>
        <OptionsDropdown items={items} />
        <Flex
          alignItems="center"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          paddingTop={{ base: 2, lg: 6 }}
          width="100%"
        >
          {currentTokenInput === 'erc20' && <ERC20ApproveAndTransferButton />}
          {currentTokenInput === 'native' && <NativeToken />}
        </Flex>
      </>
    </WalletStatusVerifier>
  )
}

const transactionButton = {
  demo: <TransactionButton />,
  href: 'https://bootnodedev.github.io/dAppBooster/variables/components_sharedComponents_TransactionButton.TransactionButton.html',
  icon: <Icon />,
  text: (
    <>
      Transfer native cryptocurrency to your own address, or check ERC20 allowance, approve ERC20
      use, and execute a demo transaction.
    </>
  ),
  title: 'Transaction button',
}

export default transactionButton
