import { PropsWithChildren } from 'react'
import styled, { css } from 'styled-components'

import { useTheme } from 'next-themes'

import { Dark } from '@/src/sharedComponents/ui/SwitchThemeButton/assets/Dark'
import { Light } from '@/src/sharedComponents/ui/SwitchThemeButton/assets/Light'

export const Wrapper = styled.button`
  --animation-delay: 0.25s;

  align-items: center;
  background: #fff;
  border-radius: 40px;
  border: none;
  box-shadow:
    0 2.1px 4.625px 0 rgb(0 0 0 / 5%),
    0 9.6px 13px 0 rgb(0 0 0 / 8%),
    0 24.3px 34.875px 0 rgb(0 0 0 / 10%),
    0 48px 80px 0 rgb(0 0 0 / 15%);
  cursor: pointer;
  display: flex;
  gap: 4px;
  height: 44px;
  justify-content: space-between;
  padding: 4px 12px;
  position: relative;
  width: 84px;

  &:active {
    opacity: 0.8;
  }
`

const Background = styled.div<{ theme: string | undefined }>`
  --size: 36px;

  background-color: var(--theme-color-2);
  border-radius: 50%;
  display: flex;
  height: var(--size);
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: ${({ theme }) => (theme === 'light' ? '44px' : '4px')};
  transition: left var(--animation-delay) ease-in-out;
  width: var(--size);
  z-index: 1;
`

const IconCSS = css`
  position: relative;
  z-index: 5;

  * {
    transition: fill var(--animation-delay) ease-in-out;
  }
`

const LightIcon = styled(Light)`
  ${IconCSS}
`

const DarkIcon = styled(Dark)`
  ${IconCSS}
`

export const SwitchThemeButton: React.FC<PropsWithChildren> = ({ ...restProps }) => {
  const { setTheme, theme } = useTheme()

  return (
    <Wrapper onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} {...restProps}>
      <DarkIcon />
      <LightIcon />
      <Background theme={theme} />
    </Wrapper>
  )
}
