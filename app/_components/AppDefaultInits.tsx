"use client";

import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/app/_lib/wagmi.config";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientConfig } from "@/app/_lib/queryClient.config";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ErrorBoundary from "@/app/_components/ErrorBoundary";

export default function AppDefaultInits({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClientConfig}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}
