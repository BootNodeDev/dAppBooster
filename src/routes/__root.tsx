import styled from 'styled-components'

import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Wrapper, InnerContainer as Inner, Main } from 'db-ui-toolkit'
import { ThemeProvider } from 'next-themes'

import { TanStackReactQueryDevtools } from '@/src/sharedComponents/helpers/TanStackReactQueryDevtools'
import { TanStackRouterDevtools } from '@/src/sharedComponents/helpers/TanStackRouterDevtools'
import { ContainerPadding } from '@/src/sharedComponents/ui/ContainerPadding'
import { Footer } from '@/src/sharedComponents/ui/Footer'
import { Header } from '@/src/sharedComponents/ui/Header'
import { Web3Provider } from '@/src/sharedComponents/web3/Web3Provider'
import { GlobalStyles } from '@/src/styles/globalStyles'

import 'modern-normalize/modern-normalize.css'

export const Route = createRootRoute({
  component: Root,
})

const InnerContainer = styled(Inner)`
  flex-direction: column;
  min-height: 100%;

  ${ContainerPadding}
`

function Root() {
  return (
    <ThemeProvider defaultTheme={'light'}>
      <GlobalStyles />
      <Wrapper>
        <Web3Provider>
          <Header />
          <Main>
            <InnerContainer>
              <Outlet />
            </InnerContainer>
          </Main>
          <TanStackReactQueryDevtools />
          <TanStackRouterDevtools />
        </Web3Provider>
        <Footer />
      </Wrapper>
    </ThemeProvider>
  )
}
