import { type FC, type HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

import { breakpointMediaQuery } from 'db-ui-toolkit'

import Item, { type Props as ItemProps } from '@/src/pageComponents/home/Examples/Item'

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
  padding: calc(var(--base-common-padding-xl) * 2) var(--base-common-padding);
  row-gap: calc(var(--base-gap-xl) * 2);
  width: 1066px;

  ${breakpointMediaQuery(
    'tabletLandscapeStart',
    css`
      padding: calc(var(--base-common-padding) * 7);
      row-gap: calc(var(--base-gap) * 5);
    `,
  )}
`

const Title = styled.h2`
  color: var(--theme-color-text-primary);
  font-size: 2.1rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;

  ${breakpointMediaQuery(
    'tabletLandscapeStart',
    css`
      font-size: 3.6rem;
    `,
  )}
`

const Items = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 100%;
  row-gap: calc(var(--base-gap) * 2);
  width: 100%;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  items: ItemProps[]
}

const List: FC<Props> = ({ items, ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Title>Built-in Features</Title>
      <Items>
        {items.map((item) => (
          <Item key={item.title} {...item} />
        ))}
      </Items>
    </Wrapper>
  )
}

export default List
