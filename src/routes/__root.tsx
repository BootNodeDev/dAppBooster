import { useState } from 'react'
import './__root.css'

import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

import { Profile } from '@/src/_components/Profile'
import { TanStackReactQueryDevtools } from '@/src/_components/TanStackReactQueryDevtools'
import { TanStackRouterDevtools } from '@/src/_components/TanStackRouterDevtools'
import { Web3Provider, ConnectWalletButton } from '@/src/_components/Web3Provider'

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Web3Provider>
        <ConnectWalletButton />
        <Profile />
        <hr />
        <div>
          <Link to="/">Home</Link>
          {' | '}
          <Link to="/about">About</Link>
          {' | '}
          <Link to="/contact">Contact</Link>
        </div>
        <hr />
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        </div>
        <hr />
        <Outlet />
        <TanStackReactQueryDevtools />
      </Web3Provider>
      <TanStackRouterDevtools />
    </>
  )
}
