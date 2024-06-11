import styled from 'styled-components'

import { Title, Text } from 'db-ui-toolkit'
import { useAccount, useEnsName } from 'wagmi'
import { mainnet } from 'wagmi/chains'

import Hash from '@/src/sharedComponents/ui/Hash'
import Avatar from '@/src/sharedComponents/web3/Avatar'

const Wrapper = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`

const Grid = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
`

export const Home = () => {
  const { address } = useAccount()
  const { data, error, status } = useEnsName({
    address: '0x87885AaEEdED51C7e3858a782644F5d89759f245',
    chainId: mainnet.id,
  })

  return (
    <Wrapper>
      <Title>Welcome to dApp👻ster!</Title>
      <Text>
        {status === 'pending' ? (
          <>Loading ENS name</>
        ) : status === 'error' ? (
          <>Error fetching ENS name: {error.message}</>
        ) : (
          <>
            <b>ENS name:</b> {data}
          </>
        )}
      </Text>
      <Hash
        explorerURL="https://etherscan.io/address/0x87885aaeeded51c7e3858a782644f5d89759f245"
        hash="0x87885aaeeded51c7e3858a782644f5d89759f245"
        onCopy={() => console.log('Copied!')}
        showCopyButton
      />

      <Grid>
        <b>Avatar: </b>
        <Avatar address={address || '0x87885AaEEdED51C7e3858a782644F5d89759f245'} />
      </Grid>
    </Wrapper>
  )
}
