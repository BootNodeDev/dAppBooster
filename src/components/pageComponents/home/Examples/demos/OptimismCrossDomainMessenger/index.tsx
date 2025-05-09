import Icon from '@/src/components/pageComponents/home/Examples/demos/OptimismCrossDomainMessenger/Icon'
import Wrapper from '@/src/components/pageComponents/home/Examples/demos/OptimismCrossDomainMessenger/Wrapper'
import Hash from '@/src/components/sharedComponents/Hash'
import TransactionButton from '@/src/components/sharedComponents/TransactionButton'
import { withWalletStatusVerifier } from '@/src/components/sharedComponents/WalletStatusVerifier'
import { getContract } from '@/src/constants/contracts/contracts'
import { useL1CrossDomainMessengerProxy } from '@/src/hooks/useOPL1CrossDomainMessengerProxy'
import { useWeb3StatusConnected } from '@/src/hooks/useWeb3Status'
import { getExplorerLink } from '@/src/utils/getExplorerLink'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'
import { Flex, Span } from '@chakra-ui/react'
import { useState } from 'react'
import type { Address } from 'viem'
import { parseEther } from 'viem'
import { optimismSepolia, sepolia } from 'viem/chains'
import { extractTransactionDepositedLogs, getL2TransactionHash } from 'viem/op-stack'

const OptimismCrossDomainMessenger = withWalletStatusVerifier(
  withSuspenseAndRetry(() => {
    // https://sepolia-optimism.etherscan.io/address/0xb50201558b00496a145fe76f7424749556e326d8
    const AAVEProxy = '0xb50201558b00496a145fe76f7424749556e326d8'
    const { address: walletAddress, readOnlyClient } = useWeb3StatusConnected()

    const contract = getContract('AAVEWeth', optimismSepolia.id)
    const depositValue = parseEther('0.01')

    const [l2Hash, setL2Hash] = useState<Address | null>(null)

    const sendCrossChainMessage = useL1CrossDomainMessengerProxy({
      fromChain: sepolia,
      contractName: 'AAVEWeth',
      functionName: 'depositETH',
      l2ContractAddress: contract.address,
      args: [AAVEProxy, walletAddress, 0],
      value: depositValue,
    })

    return (
      <Wrapper title="Execute transaction">
        <p>
          Deposit <b>0.01</b> ETH in{' '}
          <a
            href="https://staging.aave.com/?marketName=proto_optimism_sepolia_v3"
            rel="noreferrer"
            target="_blank"
          >
            Optimism Sepolia AAVE market
          </a>{' '}
          from Sepolia.
        </p>
        <TransactionButton
          key="send"
          transaction={async () => {
            setL2Hash(null)
            const hash = await sendCrossChainMessage()
            const receipt = await readOnlyClient.waitForTransactionReceipt({ hash })
            const [log] = extractTransactionDepositedLogs(receipt)
            const l2Hash = getL2TransactionHash({ log })
            setL2Hash(l2Hash)
            return hash
          }}
        >
          Deposit ETH
        </TransactionButton>
        {l2Hash && (
          <Flex
            alignItems="center"
            display="flex"
            gap={2}
          >
            <Span>OpSepolia tx</Span>
            <Hash
              explorerURL={getExplorerLink({ chain: optimismSepolia, hashOrAddress: l2Hash })}
              hash={l2Hash}
            />
          </Flex>
        )}
      </Wrapper>
    )
  }),
  { chainId: sepolia.id },
)

const optimismCrossdomainMessenger = {
  demo: <OptimismCrossDomainMessenger />,
  href: 'https://bootnodedev.github.io/dAppBooster/functions/hooks_useOPL1CrossDomainMessengerProxy.useL1CrossDomainMessengerProxy.html',
  icon: <Icon />,
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
}

export default optimismCrossdomainMessenger
