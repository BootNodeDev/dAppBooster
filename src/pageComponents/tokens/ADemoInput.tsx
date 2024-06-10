import { useState } from 'react'
import styled from 'styled-components'

import { Button } from 'db-ui-toolkit'

import { BigNumberInput } from '@/src/sharedComponents/web3/BigNumberInput'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  row-gap: 6px;
  width: 300px;
`

const Error = styled.p`
  text-align: center;
  color: red;
  font-weight: 400;
`

const decimals = 6
const max = '1.999998'
const min = '0.000001'

export const ADemoInput = () => {
  const [value, setValue] = useState('1.123')
  const [disabled, setDisabled] = useState(false)
  const [error, setError] = useState<{ value: string; message: string } | null>()

  const handleValueChange = (value: string) => {
    console.log('value', value, typeof value)
    setValue(value)
  }

  const handleError = (error?: { value: string; message: string } | null) => {
    setError(error)
  }

  const toggleDisabled = () => {
    setDisabled((prev) => !prev)
  }

  return (
    <Wrapper>
      <BigNumberInput
        decimals={decimals}
        disabled={disabled}
        max={max}
        min={min}
        onChange={handleValueChange}
        onError={handleError}
        value={value}
      />
      <>
        {error === undefined ? (
          <p>pristine</p>
        ) : error === null ? (
          <p>no error</p>
        ) : (
          <Error>😱 {error.message} 😱</Error>
        )}
      </>
      <ul>
        <li>decimals: {decimals}</li>
        <li>max: {max}</li>
        <li>min: {min}</li>
      </ul>
      <div>
        <Button onClick={() => setValue(max)}>set Max</Button>
      </div>
      <div>
        <Button onClick={() => setValue(min)}>set Min</Button>
      </div>
      <div>
        <Button onClick={() => toggleDisabled()}>{disabled ? 'Enable' : 'Disable'}</Button>
      </div>
    </Wrapper>
  )
}
