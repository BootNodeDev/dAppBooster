import { useState } from 'react'
import 'modern-normalize/modern-normalize.css'
import styled, { css } from 'styled-components'

import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

import { Profile } from '@/src/components/Profile'
import { TanStackReactQueryDevtools } from '@/src/components/TanStackReactQueryDevtools'
import { TanStackRouterDevtools } from '@/src/components/TanStackRouterDevtools'
import { Web3Provider, ConnectWalletButton } from '@/src/components/Web3Provider'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100vh;
  justify-content: center;
`

const Links = styled.div`
  column-gap: 16px;
  display: flex;
`

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  const [count, setCount] = useState(0)

  return (
    <Wrapper>
      <Web3Provider>
        <ConnectWalletButton />
        <Profile />
        <hr />
        <Links>
          <Link to="/">Home</Link>
          {' | '}
          <Link to="/about">About</Link>
          {' | '}
          <Link to="/contact">Contact</Link>
        </Links>
        <hr />
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        </div>
        <hr />
        <Outlet />
        <TanStackReactQueryDevtools />
      </Web3Provider>
      <TanStackRouterDevtools />
    </Wrapper>
  )
}
