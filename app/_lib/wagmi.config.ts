import { mainnet, sepolia } from "viem/chains";
import { http, createConfig } from "wagmi";

const INFURA_TOKEN = process.env.NEXT_PUBLIC_INFURA_TOKEN;

if (!INFURA_TOKEN) throw new Error("INFURA_TOKEN is not set");

export const supportedChains = [mainnet, sepolia] as const;

export type ChainKeys = (typeof supportedChains)[number]["id"];

export const wagmiConfig = createConfig({
  chains: supportedChains,
  ssr: true,
  transports: {
    [mainnet.id]: http(`https://mainnet.infura.io/v3/${INFURA_TOKEN}`),
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${INFURA_TOKEN}`),
  },
});
