import { type GetExplorerUrlParams, getExplorerLink } from '@/src/utils/getExplorerLink'

interface ExplorerLinkProps extends GetExplorerUrlParams {
  text?: string
}

export const ExplorerLink = ({ text = 'View on explorer', ...props }: ExplorerLinkProps) => {
  return (
    <a href={getExplorerLink(props)} rel="noopener noreferrer" target="_blank">
      {text}
    </a>
  )
}
