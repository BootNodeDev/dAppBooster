import styled from 'styled-components'

import ImgGhostDark from '@/src/components/pageComponents/home/Welcome/Ghost/assets/img-ghost-dark.svg'
import ImgGhostLight from '@/src/components/pageComponents/home/Welcome/Ghost/assets/img-ghost-light.svg'

const Ghost = styled.img`
  --ghost-image: url(${ImgGhostLight});

  [data-theme='dark'] & {
    --ghost-image: url(${ImgGhostDark});
  }

  content: var(--ghost-image);
  object-fit: none;
  flex-grow: 0;
  flex-shrink: 0;
`

export default Ghost
