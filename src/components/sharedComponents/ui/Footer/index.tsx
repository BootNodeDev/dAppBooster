import Socials from '@/src/components/sharedComponents/ui/Footer/Socials'
import { Inner } from '@/src/components/ui/Inner'
import { LogoMini } from '@bootnodedev/db-ui-toolkit'
import { Flex } from '@chakra-ui/react'
import packageJSON from '@packageJSON'
import type { FC } from 'react'

// const Line = styled.div`
//   [data-theme='light'] & {
//     background-color: #c5c2cb;
//   }

//   [data-theme='dark'] & {
//     background-color: #5f6178;
//   }

//   height: 17px;
//   width: 1px;
// `;

// const AppVersion = styled.div`
//   font-size: 1.2rem;
//   line-height: 1.2;
//   margin-top: var(--base-gap);
// `;

export const Footer: FC = ({ ...restProps }) => {
  return (
    <Flex
      alignItems="center"
      as="footer"
      backgroundColor="var(--theme-footer-background-color)"
      color="var(--theme-footer-text-color)"
      display="flex"
      flexGrow={0}
      flexShrink={0}
      height="92px"
      justifyContent="center"
      mt={8}
      {...restProps}
    >
      <Inner>
        <a
          href="https://www.bootnode.dev/"
          rel="noreferrer"
          target="_blank"
          title="Building the future of Web3"
        >
          <LogoMini />
        </a>
        {/* <Line /> */}
        <Socials />
      </Inner>
      {/* <AppVersion>Version: {packageJSON.version}</AppVersion> */}
    </Flex>
  )
}
