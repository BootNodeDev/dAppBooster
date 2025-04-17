import type { ComponentProps, FC, ReactNode } from 'react'
import styled, { css } from 'styled-components'

import { breakpointMediaQuery } from '@bootnodedev/db-ui-toolkit'

const Wrapper = styled.div`
  [data-theme='light'] & {
    --theme-op-background: #fff;
    --theme-op-title-color: #2e3048;
    --theme-op-text-color: #2e3048;
  }

  [data-theme='dark'] & {
    --theme-op-background: #373954;
    --theme-op-title-color: #fff;
    --theme-op-text-color: #e2e0e7;
  }

  background-color: var(--theme-op-background);
  border-radius: var(--base-border-radius);
  display: flex;
  flex-direction: column;
  padding: var(--base-common-padding-xl);
  row-gap: calc(var(--base-gap) * 3);
  width: 100%;

  ${breakpointMediaQuery(
    'desktopStart',
    css`
      margin-top: calc(var(--base-common-padding) * 3);
    `,
  )}

  p {
    font-size: 1.5rem;
    line-height: 1.2;
    margin: 0;

    &,
    & a {
      color: var(--theme-op-text-color);
    }

    a:hover {
      text-decoration: none;
    }
  }
`

const Title = styled.h3`
  color: var(--theme-op-title-color);
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
`

interface Props extends Omit<ComponentProps<'div'>, 'title'> {
  title: string | ReactNode
}

const WrapperComponent: FC<Props> = ({ children, title, ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Title>{title}</Title>
      {children}
    </Wrapper>
  )
}

export default WrapperComponent
