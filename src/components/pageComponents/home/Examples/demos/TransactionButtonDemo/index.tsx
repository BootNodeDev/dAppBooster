import { OptionsDropdown } from '@/src/components/pageComponents/home/Examples/demos/OptionsDropdown'
import ERC20ApproveAndTransferButtonDemo from '@/src/components/pageComponents/home/Examples/demos/TransactionButtonDemo/ERC20ApproveAndTransferButtonDemo'
import NativeTokenDemo from '@/src/components/pageComponents/home/Examples/demos/TransactionButtonDemo/NativeTokenDemo'
import { WalletStatusVerifier } from '@/src/components/sharedComponents/WalletStatusVerifier'
import { Flex } from '@chakra-ui/react'
import { useState } from 'react'
import { sepolia } from 'wagmi/chains'

type Options = 'erc20' | 'native'

const TransactionButtonDemo = () => {
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
          {currentTokenInput === 'erc20' && <ERC20ApproveAndTransferButtonDemo />}
          {currentTokenInput === 'native' && <NativeTokenDemo />}
        </Flex>
      </>
    </WalletStatusVerifier>
  )
}

export default TransactionButtonDemo
