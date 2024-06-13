import { Text } from 'db-ui-toolkit'
import { Address } from 'viem'
import { useEnsName } from 'wagmi'
import { mainnet } from 'wagmi/chains'

interface Props {
  address: Address
}

const EnsName = ({ address }: Props) => {
  const { data, error, status } = useEnsName({
    address: address,
    chainId: mainnet.id,
  })

  return (
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
  )
}

export default EnsName
