import { createRootRoute, Outlet } from '@tanstack/react-router'
import { ThemeProvider } from 'next-themes'

import { TanStackReactQueryDevtools } from '@/src/sharedComponents/helpers/TanStackReactQueryDevtools'
import { TanStackRouterDevtools } from '@/src/sharedComponents/helpers/TanStackRouterDevtools'
import { Footer } from '@/src/sharedComponents/ui/Footer'
import { Header } from '@/src/sharedComponents/ui/Header'
import { Main } from '@/src/sharedComponents/ui/Main'
import { Wrapper } from '@/src/sharedComponents/ui/Wrapper'
import { Web3Provider } from '@/src/sharedComponents/web3/Web3Provider'
import { GlobalStyles } from '@/src/styles/globalStyles'

import 'modern-normalize/modern-normalize.css'

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  return (
    <ThemeProvider defaultTheme={'light'}>
      <GlobalStyles />
      <Wrapper>
        <Web3Provider>
          <Header />
          <Main>
            <Outlet />
          </Main>
          <Footer />
          <TanStackReactQueryDevtools />
          <TanStackRouterDevtools />
        </Web3Provider>
      </Wrapper>
    </ThemeProvider>
  )
}
