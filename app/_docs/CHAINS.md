# Adding New Chains and Testnets to Your dApp

This doc describes how to add new testnets and blockchain networks to your dApp using dAppBooster. Follow these instructions whether you're using default providers or integrating a custom RPC URL.

## Prerequisites

Before moving forward, make sure you have the following:

- A fundamental knowledge of environment variables and TypeScript.
- The capacity to modify and access the dApp's codebase.
- Have the RPC URLs for the chains you want to add on hand if you're going to use custom RPCs.

## Update the Chain Configuration

Open your project and navigate to `app/_lib/chains.config.ts`. The configurations for the testnets and chains that your dApp presently supports are contained in this file.

### Adding a New Chain

1. Import the chain object from `viem/chains`. For example, to add `polygon`, you would add:

   ```ts
   import { polygon, polygonMumbai } from 'viem/chains'
   ```

2. Add the imported chain to the `supportedChains` or `supportedTestChains` array, depending on whether it's a mainnet or a testnet. For example:

   ```ts
   export const supportedChains = [mainnet, polygon] as const // for mainnets
   export const supportedTestChains = [sepolia, polygonMumbai] as const //for testnets
   ```

### Adding Custom RPC URLs

1. If you're using a custom RPC URL, ensure you have an environment variable for it in your `.env` file, similar to:

   ```env
   NEXT_PUBLIC_RPC_URL_POLYGON=https://polygon.llamarpc.com
   ```

2. In `app/_lib/chains.config.ts`, add a new entry to `transports` or `testTransports` using the chain's ID and your custom RPC URL. If no custom RPC is provided, the default provider will be used. For example:

   ```ts
   export const transports: Record<supportedChainsIds, HttpTransport> = {
     [mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL_MAINNET),
     [polygon.id]: http(process.env.NEXT_PUBLIC_RPC_URL_POLYGON),
   }
   export const testTransports: Record<supportedTestChainsIds, HttpTransport> = {
     [sepolia.id]: http(), // you can pass custom RPC from env var here too
     [polygonMumbai.id]: http(), // you can pass custom RPC from env var here too
   }
   ```

### Enable Testnets

You can enable testnets by setting the `NEXT_PUBLIC_ENABLE_TESTNETS` in your `.env` file to `true`. This will display the testnets in the dApp's UI.

## Troubleshooting

**Fixing Missing RPC URLs**: Verify that `app/_lib/chains.config.ts` appropriately references and includes all custom RPC URLs that are specified in the `.env` file.  
**Not loaded environment variables:** Make sure the variables are loaded appropriately by checking your deployment setup and environment configuration twice.  
**Problems with Chain Interaction**: Ensure that the blockchain network is up and running, and that the chain IDs and RPC URLs are accurate.
