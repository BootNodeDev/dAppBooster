import { Hash } from 'viem'

import { ExplorerLink } from '@/src/components/sharedComponents/ExplorerLink'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'

export const ToastNotification = ({
  hash,
  message,
}: {
  message: JSX.Element | string
  hash?: Hash
  showClose?: boolean
}) => {
  const { readOnlyClient } = useWeb3Status()
  const chain = readOnlyClient?.chain

  if (!chain) return null

  return (
    <div>
      <div>{message}</div>
      {hash && <ExplorerLink chain={chain} hashOrAddress={hash} />}
    </div>
  )
}
