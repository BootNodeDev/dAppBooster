import { type FC, useRef, type KeyboardEvent } from 'react'
import styled from 'styled-components'

import { Dropdown, DropdownExposedProps } from 'db-ui-toolkit'

import DropdownButton from '@/src/sharedComponents/DropdownButton'
import TokenLogo from '@/src/sharedComponents/TokenLogo'
import TokenSelect, {
  Loading,
  type Props as TokenSelectProps,
} from '@/src/sharedComponents/TokenSelect'
import { type Token } from '@/src/types/token'

const Icon = styled.div<{ iconSize?: number }>`
  align-items: center;
  border-radius: 50%;
  display: flex;
  height: ${({ iconSize }) => iconSize}px;
  justify-content: center;
  overflow: hidden;
  width: ${({ iconSize }) => iconSize}px;
`

interface Props extends TokenSelectProps {
  currentToken?: Token | undefined
  iconSize?: number
}

/**
 * @name TokenDropdown
 * @description A dropdown component that allows users to select a token
 *
 * @extends TokenSelectProps
 * @param {Token} [currentToken=undefined] - The current token. Default is undefined.
 * @param {number} [iconSize=24] - The size of the token icon. Default is 24.
 */
const TokenDropdown: FC<Props> = ({
  className,
  currentToken,
  iconSize = 24,
  onTokenSelect,
  ...restProps
}: Props) => {
  const dropdownRef = useRef<DropdownExposedProps>(null)

  /**
   * Closes the dropdown
   */
  const handleCloseDropdown = () => {
    if (dropdownRef.current) {
      dropdownRef.current.closeDropdown()
    }
  }

  /**
   * Handle token selection and close the dropdown
   * @param {Token} [token=undefined] - The selected token. Default is undefined.
   */
  const handleTokenSelect = (token: Token | undefined) => {
    onTokenSelect(token)
    handleCloseDropdown()
  }

  return (
    <Dropdown
      button={
        <DropdownButton>
          {currentToken ? (
            <>
              <Icon>
                <TokenLogo size={iconSize} token={currentToken} />
              </Icon>
              {currentToken.symbol}
            </>
          ) : (
            'Select token'
          )}
        </DropdownButton>
      }
      className={`${className ? className : ''} tokenDropdown`}
      closeOnClick={false}
      items={
        <TokenSelect
          onTokenSelect={handleTokenSelect}
          suspenseFallback={<Loading />}
          {...restProps}
        />
      }
      onKeyUp={(e: KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Escape') {
          handleCloseDropdown()
        }
      }}
      position="right"
      ref={dropdownRef}
    />
  )
}

export default TokenDropdown
