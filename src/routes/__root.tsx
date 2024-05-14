import { useState } from "react";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import { config } from "../_lib/wagmi.config";
import { Profile } from "../_components/Profile";
import { TanStackRouterDevtools } from "../_components/TanStackRouterDevtools";

import "./__root.css";

export const Route = createRootRoute({
  component: Root,
});

const queryClient = new QueryClient();

function Root() {
  const [count, setCount] = useState(0);

  return (
    <>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <>
            <Profile />
            <hr />
            <div>
              <Link to="/">Home</Link>
              {" | "}
              <Link to="/about">About</Link>
              {" | "}
              <Link to="/contact">Contact</Link>
            </div>
            <hr />
            <div className="card">
              <button onClick={() => setCount((count) => count + 1)}>
                count is {count}
              </button>
            </div>
            <hr />
            <Outlet />
          </>
        </QueryClientProvider>
      </WagmiProvider>
      <TanStackRouterDevtools />
    </>
  );
}
