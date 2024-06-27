import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Wrapper, Main } from 'db-ui-toolkit'
import { ThemeProvider } from 'next-themes'

import { Web3Provider } from '@/src/providers/Web3Provider'
import { Footer } from '@/src/sharedComponents/Footer'
import { Header } from '@/src/sharedComponents/Header'
import { TanStackReactQueryDevtools } from '@/src/sharedComponents/TanStackReactQueryDevtools'
import { TanStackRouterDevtools } from '@/src/sharedComponents/TanStackRouterDevtools'
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
