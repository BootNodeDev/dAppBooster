import { type FC, InputHTMLAttributes } from 'react'

const SearchTokenInput: FC<InputHTMLAttributes<HTMLInputElement>> = ({ ...restProps }) => {
  return <input type="text" {...restProps} />
}

export default SearchTokenInput
