import { useState } from 'react'
import styled from 'styled-components'

import type { Address } from 'viem'
import { parseEther } from 'viem'
import { optimismSepolia, sepolia } from 'viem/chains'
import { extractTransactionDepositedLogs, getL2TransactionHash } from 'viem/op-stack'

import Wrapper from '@/src/components/pageComponents/home/Examples/demos/OptimismCrossDomainMessenger/Wrapper'
import Hash from '@/src/components/sharedComponents/Hash'
import TransactionButton from '@/src/components/sharedComponents/TransactionButton'
import { withWalletStatusVerifier } from '@/src/components/sharedComponents/WalletStatusVerifier'
import { PrimaryButton } from '@/src/components/sharedComponents/ui/Buttons'
import { getContract } from '@/src/constants/contracts/contracts'
import { useL1CrossDomainMessengerProxy } from '@/src/hooks/useOPL1CrossDomainMessengerProxy'
import { useWeb3StatusConnected } from '@/src/hooks/useWeb3Status'
import { getExplorerLink } from '@/src/utils/getExplorerLink'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'

const HashWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

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
        <PrimaryButton
          as={TransactionButton}
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
        </PrimaryButton>

        {l2Hash && (
          <HashWrapper>
            <span>OpSepolia tx </span>
            <Hash
              explorerURL={getExplorerLink({ chain: optimismSepolia, hashOrAddress: l2Hash })}
              hash={l2Hash}
            />
          </HashWrapper>
        )}
      </Wrapper>
    )
  }),
  { chainId: sepolia.id },
)

export default OptimismCrossDomainMessenger
