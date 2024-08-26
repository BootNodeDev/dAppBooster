import toast from 'react-hot-toast'
import { Hash } from 'viem'

import { ExplorerLink } from '@/src/components/sharedComponents/ExplorerLink'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'

export const ToastNotification = ({
  hash,
  message,
  showClose = false,
  toastId,
}: {
  message: JSX.Element | string
  hash?: Hash
  toastId: string
  showClose?: boolean
}) => {
  const { readOnlyClient } = useWeb3Status()
  const chain = readOnlyClient?.chain

  if (!chain) return null

  return (
    <div>
      {showClose && <button onClick={() => toast.remove(toastId)}>x</button>}
      <div>{message}</div>
      {hash && <ExplorerLink chain={chain} hashOrAddress={hash} />}
    </div>
  )
}
