'use client'

import { HTMLAttributes } from 'react'

const Wrapper: React.FC<HTMLAttributes<HTMLUListElement>> = ({ children, ...restProps }) => {
  return <ul {...restProps}>{children}</ul>
}

export default Wrapper
