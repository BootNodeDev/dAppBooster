# Adding New Chains and Testnets to Your dApp

Your decentralized application's (dApp) accessibility and interoperability within the blockchain ecosystem are improved by integrating it with numerous blockchain networks and testnets. dAppBooster makes this connection easier, making it possible for your dApp to effectively link with several chains. It is essential to manage connections to both mainnets and testnets for development, and production purposes.

In your dApp's settings, separating testnets (`DevChains`) from mainnets (`Chains`) facilitates development workflows by encouraging a clear structure. Testnets provide safe, economical interactions without the danger of actual asset loss during the development stage. It also helps to avoid typical deployment errors, like connecting to a testnet in a production build, by clearly identifying different environments in your configuration files.

There are several benefits to storing RPC URLs as environment variables:

- Prevents sensitive data from entering your application, thereby lowering the risk of security flaws.
- Facilitates maintenance and updates by making it simple to update RPC URLs without having to change the code.
- Allows distinct RPC URLs to be used in development and production environments, ensuring that the right networks are utilized at every stage of development.

Following these guidelines ensures your dApp remains adaptable, secure, and easy to maintain as it scales across different networks.

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

**Fixing Missing RPC URLs**: Verify that `app/_constants/chains.ts` appropriately references and includes all custom RPC URLs that are specified in the `.env` file.  
**Not loaded environment variables:** Make sure the variables are loaded appropriately by checking your deployment setup and environment configuration twice.  
**Problems with Chain Interaction**: Ensure that the blockchain network is up and running, and that the chain IDs and RPC URLs are accurate.
