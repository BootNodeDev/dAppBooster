import { type FC, InputHTMLAttributes, ReactElement } from 'react'

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  renderInput?: (props: InputHTMLAttributes<HTMLInputElement>) => ReactElement
}

const SearchTokenInput: FC<SearchInputProps> = ({ renderInput, ...restProps }) => {
  return <>{renderInput ? renderInput({ ...restProps }) : <input type="text" {...restProps} />}</>
}

export default SearchTokenInput
