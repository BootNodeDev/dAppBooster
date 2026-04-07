import { Flex, Span } from '@chakra-ui/react'
import { useState } from 'react'
import type { Address } from 'viem'
import { parseEther } from 'viem'
import { optimismSepolia, sepolia } from 'viem/chains'
import { extractTransactionDepositedLogs, getL2TransactionHash } from 'viem/op-stack'
import { usePublicClient } from 'wagmi'
import Icon from '@/src/components/pageComponents/home/Examples/demos/OptimismCrossDomainMessenger/Icon'
import Wrapper from '@/src/components/pageComponents/home/Examples/wrapper'
import { getContract } from '@/src/contracts/definitions'
import { useL1CrossDomainMessengerProxy } from '@/src/contracts/hooks/useOPL1CrossDomainMessengerProxy'
import { Hash } from '@/src/core/components'
import { withSuspenseAndRetry } from '@/src/core/utils'
import { getExplorerUrl } from '@/src/sdk/core/chain/explorer'
import { WalletGuard } from '@/src/sdk/react/components'
import { useChainRegistry, useWallet } from '@/src/sdk/react/hooks'
// TODO: full migration requires refactoring useL1CrossDomainMessengerProxy to return TransactionParams
import { LegacyTransactionButton as TransactionButton } from '@/src/transactions/components'
import { TransactionNotificationProvider } from '@/src/transactions/providers'

const OptimismCrossDomainMessenger = withSuspenseAndRetry(() => {
  // https://sepolia-optimism.etherscan.io/address/0xb50201558b00496a145fe76f7424749556e326d8
  const AAVEProxy = '0xb50201558b00496a145fe76f7424749556e326d8'
  const wallet = useWallet({ chainId: sepolia.id })
  const walletAddress = wallet.status.activeAccount as Address
  const readOnlyClient = usePublicClient()
  const registry = useChainRegistry()

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
    walletAddress,
  })

  const l2ExplorerUrl = l2Hash
    ? getExplorerUrl(registry, { chainId: optimismSepolia.id, tx: l2Hash })
    : null

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
      <TransactionNotificationProvider>
        <TransactionButton
          key="send"
          transaction={async () => {
            setL2Hash(null)
            const hash = await sendCrossChainMessage()
            const receipt = await readOnlyClient!.waitForTransactionReceipt({ hash })
            const [log] = extractTransactionDepositedLogs(receipt)
            const l2Hash = getL2TransactionHash({ log })
            setL2Hash(l2Hash)
            return hash
          }}
        >
          Deposit ETH
        </TransactionButton>
      </TransactionNotificationProvider>
      {l2Hash && (
        <Flex
          alignItems="center"
          display="flex"
          gap={2}
        >
          <Span>OpSepolia tx</Span>
          <Hash
            explorerURL={l2ExplorerUrl ?? ''}
            hash={l2Hash}
          />
        </Flex>
      )}
    </Wrapper>
  )
})

const optimismCrossdomainMessenger = {
  demo: (
    <WalletGuard chainId={sepolia.id}>
      <OptimismCrossDomainMessenger />
    </WalletGuard>
  ),
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
