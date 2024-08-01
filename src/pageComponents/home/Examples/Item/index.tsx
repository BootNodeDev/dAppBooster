import { type FC, type HTMLAttributes, type ReactNode } from 'react'
import styled, { css } from 'styled-components'

import { breakpointMediaQuery } from 'db-ui-toolkit'

import BaseBadge from '@/src/pageComponents/home/Examples/Item/Badge'
import DocumentationButton from '@/src/pageComponents/home/Examples/Item/DocumentationButton'

const Wrapper = styled.div`
  [data-theme='light'] & {
    --theme-examples-item-background-color: #f7f7f7;
  }

  [data-theme='dark'] & {
    --theme-examples-item-background-color: #2e3048;
  }

  background-color: var(--theme-examples-item-background-color);
  border-radius: var(--base-border-radius);
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--base-gap-xl) + var(--base-gap));
  max-width: 100%;
  padding: calc(var(--base-common-padding-xl) * 2) var(--base-common-padding-xl)
    var(--base-common-padding-xl);

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      column-gap: var(--base-gap-xl);
      flex-direction: row;
      padding: var(--base-common-padding-xl) var(--base-common-padding-xl)
        var(--base-common-padding-xl) calc(var(--base-common-padding-xl) * 2);
    `,
  )};
`

const Info = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex: 1;
  row-gap: var(--base-gap-xl);

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      align-items: flex-start;
      padding: var(--base-common-padding-xl) 0 0;
    `,
  )};
`

const Icon = styled.div`
  --icon-size: 40px;

  align-items: center;
  background-color: var(--theme-color-primary);
  border-radius: 50%;
  color: #fff;
  display: flex;
  height: var(--icon-size);
  justify-content: center;
  width: var(--icon-size);
`

const Title = styled.h2`
  color: var(--theme-color-text-primary);
  font-size: 2.4rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  text-align: center;

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      text-align: left;
    `,
  )};
`

const Text = styled.p`
  color: var(--theme-color-text-primary);
  font-size: 1.6rem;
  font-weight: 500;
  line-height: 1.5;
  margin: 0;
  text-align: center;

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      text-align: left;
    `,
  )};
`

const Demo = styled.div`
  align-items: center;
  background-color: var(--theme-examples-list-background-color);
  border-radius: var(--base-border-radius);
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  min-width: 0;
  padding: calc(var(--base-common-padding) * 6) var(--base-common-padding)
    calc(var(--base-common-padding) * 4);
  position: relative;

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      min-height: 205px;
      padding: calc(var(--base-common-padding) * 6) calc(var(--base-common-padding) * 3)
        calc(var(--base-common-padding) * 3);
    `,
  )};
`

const Badge = styled(BaseBadge)`
  --badge-gap: calc(var(--base-gap) + var(--base-gap-sm));

  left: var(--badge-gap);
  position: absolute;
  top: var(--badge-gap);
`

export interface Props extends HTMLAttributes<HTMLDivElement> {
  demo: ReactNode
  href?: string
  icon: ReactNode
  text: string
  title: string
}

const Item: FC<Props> = ({ demo, href, icon, text, title, ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Info>
        <Icon>{icon}</Icon>
        <Title>{title}</Title>
        <Text>{text}</Text>
        {href && <DocumentationButton as="a" href={href} target="_blank" />}
      </Info>
      <Demo>
        <Badge />
        {demo}
      </Demo>
    </Wrapper>
  )
}

export default Item
