import React, { Suspense } from "react";

const RouterDevtoolsBase = import.meta.env.PROD
  ? () => null
  : React.lazy(() =>
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    );

export const TanStackRouterDevtools = () => (
  <Suspense>
    <RouterDevtoolsBase />
  </Suspense>
);
