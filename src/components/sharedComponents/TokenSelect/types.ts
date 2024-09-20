import type { ReactElement } from 'react'

export type Networks = Array<{
  icon: ReactElement
  id: number
  label: string
  onClick: () => void
}>
