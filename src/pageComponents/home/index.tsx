import styled from 'styled-components'

import { Title, Text } from 'db-ui-toolkit'
import { useEnsName } from 'wagmi'
import { mainnet } from 'wagmi/chains'

const Wrapper = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`

export const Home = () => {
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
    </Wrapper>
  )
}
