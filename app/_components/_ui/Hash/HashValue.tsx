'use client'

import { HTMLAttributes } from 'react'

const HashValue: React.FC<HTMLAttributes<HTMLSpanElement>> = ({ children, ...restProps }) => {
  return <span {...restProps}>{children}</span>
}

export default HashValue
