'use client'

import { LiHTMLAttributes } from 'react'

const Item: React.FC<LiHTMLAttributes<HTMLLIElement>> = ({ children, ...restProps }) => {
  return <li {...restProps}>{children}</li>
}

export default Item
