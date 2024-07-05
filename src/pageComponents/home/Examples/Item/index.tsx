import { type FC, type HTMLAttributes, type ReactNode } from 'react'
import styled from 'styled-components'

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
  gap: calc(var(--base-gap) * 2);
  max-width: 100%;
  padding: calc(var(--base-gap) * 2) calc(var(--base-gap) * 2) calc(var(--base-gap) * 2)
    calc(var(--base-gap) * 4);
`

const Info = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: calc(var(--base-gap) * 2) 0 0;
  row-gap: calc(var(--base-gap) * 2);
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
`

const Text = styled.p`
  color: var(--theme-color-text-primary);
  font-size: 1.6rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
`

const Demo = styled.div`
  align-items: center;
  background-color: var(--theme-examples-list-background-color);
  border-radius: var(--base-border-radius);
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  min-height: 205px;
  min-width: 0;
  padding: calc(var(--base-gap) * 5) calc(var(--base-gap) * 3) calc(var(--base-gap) * 3);
  position: relative;
`

const Badge = styled(BaseBadge)`
  --badge-gap: calc(var(--base-gap) + var(--base-gap-sm));

  left: var(--badge-gap);
  position: absolute;
  top: var(--badge-gap);
`

export interface Props extends HTMLAttributes<HTMLDivElement> {
  demo: ReactNode
  href: string
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
        <DocumentationButton as="a" href={href} target="_blank" />
      </Info>
      <Demo>
        <Badge />
        {demo}
      </Demo>
    </Wrapper>
  )
}

export default Item
