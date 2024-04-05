'use client'

import { HTMLAttributes } from 'react'

const Wrapper: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, ...restProps }) => {
  return <div {...restProps}>{children}</div>
}

export default Wrapper
