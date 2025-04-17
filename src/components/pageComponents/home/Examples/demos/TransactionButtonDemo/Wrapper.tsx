import type { ComponentProps, FC, ReactNode } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  [data-theme='light'] & {
    --theme-token-ens-name-background: #fff;
    --theme-token-ens-name-title-color: #2e3048;
    --theme-token-ens-name-text-color: #2e3048;

    --theme-textfield-color: #2e3048;
    --theme-textfield-background-color: #fff;
    --theme-textfield-background-color-active: rgb(0 0 0 / 5%);
    --theme-textfield-border-color: #c5c2cb;
    --theme-textfield-placeholder-color: rgb(22 29 26 / 60%);
  }

  [data-theme='dark'] & {
    --theme-token-ens-name-background: #373954;
    --theme-token-ens-name-title-color: #fff;
    --theme-token-ens-name-text-color: #e2e0e7;

    --theme-textfield-color: #fff;
    --theme-textfield-background-color: #373954;
    --theme-textfield-background-color-active: rgb(255 255 255 / 5%);
    --theme-textfield-border-color: #5f6178;
    --theme-textfield-placeholder-color: rgb(247 247 247 / 60%);
  }

  background-color: var(--theme-token-ens-name-background);
  border-radius: var(--base-border-radius);
  display: flex;
  flex-direction: column;
  padding: var(--base-common-padding-xl);
  row-gap: calc(var(--base-gap) * 3);
  width: 100%;
`

const Title = styled.h3`
  color: var(--theme-token-ens-name-title-color);
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
`

const Text = styled.div`
  align-items: center;
  column-gap: var(--base-gap);
  font-size: 1.5rem;
  line-height: 1.2;

  &,
  & a {
    color: var(--theme-token-ens-name-text-color);
  }

  a:hover {
    text-decoration: none;
  }
`

interface Props extends Omit<ComponentProps<'div'>, 'title'> {
  text?: string | ReactNode
  title: string | ReactNode
}

const WrapperComponent: FC<Props> = ({ children, text, title, ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Title>{title}</Title>
      {children}
      {text && <Text>{text}</Text>}
    </Wrapper>
  )
}

export default WrapperComponent
