/**
 * Home page sample component
 *
 * You can safely delete the contents of this file and start from scratch,
 * just make sure to keep the file itself and export a component named Home.
 */
import styled from 'styled-components'

import { Card, InnerContainer, ContainerPadding, Title } from 'db-ui-toolkit'

/**
 * A generic wrapper with some device dependent padding.
 */
const Wrapper = styled(InnerContainer)`
  ${ContainerPadding}
`

/**
 * A centered custom card component
 */
const CustomCard = styled(Card)`
  margin: auto;
`

/**
 * A styled ul tag
 */
const Ul = styled.ul`
  display: flex;
  flex-direction: column;
  font-size: 1.5rem;
  list-style: circle;
  padding-left: var(--base-common-padding-xl);
  row-gap: var(--base-gap-xl);

  li {
    margin: 0;
  }

  ul {
    row-gap: var(--base-gap);
  }
`

/**
 * A styled pre tag
 */
const Code = styled.pre`
  background-color: #f5f5f5;
  border-radius: 5px;
  font-size: 1.3rem;
  margin: var(--base-gap) 0 0;
  padding: 4px 10px;
  white-space: normal;
  word-break: break-all;
`

export const Home = ({ ...restProps }) => {
  /**
   * You can safely delete this.
   */
  return (
    <Wrapper {...restProps}>
      <CustomCard>
        <Title>Where to start:</Title>
        <Ul>
          <li>
            <b>App Routes / Page Components</b>
            <Ul>
              <li>
                App layout <Code>src/routes/__root.tsx</Code>
              </li>
              <li>
                Home page <Code>src/components/pageComponents/home/index.tsx</Code>
              </li>
            </Ul>
          </li>
          <li>
            <b>Shared Components</b>
            <Ul>
              <li>
                Header <Code>src/components/sharedComponents/Header.tsx</Code>
              </li>
              <li>
                Footer <Code>src/components/sharedComponents/Footer/index.tsx</Code>
              </li>
            </Ul>
          </li>
          <li>
            <a href="https://bootnodedev.github.io/dAppBooster/" rel="noreferrer" target="_blank">
              dAppBooster documentation
            </a>
          </li>
          <li>
            <a
              href="https://github.com/BootNodeDev/dAppBooster/tree/develop/src/components/pageComponents/home/Examples/demos"
              rel="noreferrer"
              target="_blank"
            >
              dAppBooster source code examples
            </a>
          </li>
        </Ul>
      </CustomCard>
    </Wrapper>
  )
}
