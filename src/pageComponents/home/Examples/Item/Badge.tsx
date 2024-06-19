import styled from 'styled-components'

const Badge = styled.div.attrs({ children: <>Demo</> })`
  [data-theme='light'] & {
    --theme-examples-badge-background-color: #2e3048;
  }

  [data-theme='dark'] & {
    --theme-examples-badge-background-color: #4b4d60;
  }

  align-items: center;
  background-color: var(--theme-examples-badge-background-color);
  border-radius: var(--base-border-radius-sm);
  color: #fff;
  display: flex;
  font-size: 1.2rem;
  font-weight: 500;
  height: 20px;
  line-height: 1;
  padding: 0 var(--base-gap);
`

export default Badge
