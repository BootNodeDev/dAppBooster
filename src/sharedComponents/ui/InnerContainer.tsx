import styled from 'styled-components'

import { ContainerPadding } from '@/src/sharedComponents/ui/ContainerPadding'

export const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  margin: 0 auto;
  max-width: 100%;
  width: var(--base-container-max-width);

  ${ContainerPadding}
`
