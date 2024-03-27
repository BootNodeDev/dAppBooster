import { ChainKeys, supportedChains } from "@/app/_lib/wagmi.config";
import { extractChain, isAddress } from "viem";

export const getExplorerUrl = (chainId: ChainKeys, hash: string) => {
  const chain = extractChain({ chains: supportedChains, id: chainId });

  const url = chain.blockExplorers?.default.url;

  if (!isAddress(hash)) throw new Error("Invalid hash");

  const type = hash.length > 42 ? "tx" : "address";
  return `${url}/${type}/${hash}`;
};
