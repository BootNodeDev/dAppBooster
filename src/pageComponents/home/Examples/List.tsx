import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  [data-theme='light'] & {
    --theme-examples-list-background-color: #e2e0e766;
  }

  [data-theme='dark'] & {
    --theme-examples-list-background-color: #292b43;
  }

  align-items: center;
  background-color: var(--theme-examples-list-background-color);
  border-radius: var(--base-border-radius-xl);
  display: flex;
  flex-direction: column;
  max-width: 100%;
  padding: calc(var(--base-gap) * 7);
  row-gap: calc(var(--base-gap) * 5);
  width: 1066px;
`

const Title = styled.h2`
  color: var(--theme-color-text-primary);
  font-size: 3.6rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
`

const List: React.FC<HTMLAttributes<HTMLDivElement>> = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Title>Built-in Features</Title>
      <p>Here are some examples of how you can use the theme system.</p>
    </Wrapper>
  )
}

export default List
