/**
 * Home page example
 *
 * You can safely delete the contents of this file and start from scratch,
 * just make sure to keep the file itself and export a component named Home.
 */
import styled from 'styled-components'

import { Card, Title } from 'db-ui-toolkit'

/**
 * A centered custom card component
 */
const CustomCard = styled(Card)`
  margin: auto;
  max-width: 90%;

  a {
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`

/**
 * A styled ul tag
 */
const Ul = styled.ul`
  display: flex;
  flex-direction: column;
  font-size: 1.5rem;
  list-style: circle;
  padding-left: calc(var(--base-common-padding-xl) + var(--base-common-padding));
  row-gap: var(--base-gap-xl);

  ul {
    padding-bottom: var(--base-common-padding-xl);
    padding-top: var(--base-common-padding-xl);
    row-gap: var(--base-gap);
  }
`

/**
 * A styled pre tag
 */
const Code = styled.pre`
  background-color: var(--theme-body-background-color);
  border-radius: 5px;
  font-size: 1.3rem;
  margin: var(--base-gap) 0 0;
  padding: 4px 10px;
  white-space: normal;
  word-break: break-all;
`

export const Home = () => {
  return (
    // You can safely delete this.
    <CustomCard>
      <Title>Getting started</Title>
      <Ul>
        <li>
          <a href="https://dappbooster.dev" rel="noreferrer" target="_blank">
            dAppBooster demo
          </a>
          : a fully functional dAppBooster dApp with plenty of examples.
        </li>
        <li>
          {/* TODO: Replace by correct link when the fork is ready */}
          <a
            href="https://github.com/BootNodeDev/dAppBoosterLandingPage/tree/main/src/components/pageComponents/home/Examples/demos"
            rel="noreferrer"
            target="_blank"
          >
            Demo's source code on GitHub
          </a>
        </li>
        <li>
          <a href="https://bootnodedev.github.io/dAppBooster/" rel="noreferrer" target="_blank">
            Components documentation
          </a>
        </li>
        <li>
          <b>Where to start?</b>
          <Ul>
            <li>
              Home page <Code>src/components/pageComponents/home/index.tsx</Code>
            </li>
            <li>
              Header <Code>src/components/sharedComponents/Header.tsx</Code>
            </li>
            <li>
              Footer <Code>src/components/sharedComponents/Footer/index.tsx</Code>
            </li>
            <li>
              App layout <Code>src/routes/__root.tsx</Code>
            </li>
            <li>
              Home route <Code>src/routes/index.lazy.tsx</Code>
            </li>
          </Ul>
        </li>
      </Ul>
    </CustomCard>
  )
}
