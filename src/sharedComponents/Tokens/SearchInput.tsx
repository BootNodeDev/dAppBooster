import { type FC, InputHTMLAttributes } from 'react'

const SearchInput: FC<InputHTMLAttributes<HTMLInputElement>> = ({ ...restProps }) => {
  return <input type="text" {...restProps} />
}

export default SearchInput
