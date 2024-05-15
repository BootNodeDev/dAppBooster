import { useEnsName } from 'wagmi'

export function Profile() {
  const { data, error, status } = useEnsName({
    address: '0x87885AaEEdED51C7e3858a782644F5d89759f245',
  })
  if (status === 'pending') return <div>Loading ENS name</div>
  if (status === 'error') return <div>Error fetching ENS name: {error.message}</div>
  return <div>ENS name: {data}</div>
}
