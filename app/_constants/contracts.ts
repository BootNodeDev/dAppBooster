

import { Abi, Address, erc20Abi } from "viem";
import { ChainKeys } from "@/app/_lib/wagmi.config";
import { mainnet, sepolia } from "viem/chains";

const contractNames = ["DAI"] as const;
export type ContractKeys = (typeof contractNames)[number];

export const contracts = {
  DAI: {
    address: {
      [mainnet.id]: "0x6b175474e89094c44da98b954eedeac495271d0f",
      [sepolia.id]: "0x82fb927676b53b6ee07904780c7be9b4b50db80b",
    },
    abi: erc20Abi,
  },
} satisfies Record<
  ContractKeys,
  { address: Record<ChainKeys, Address>; abi: Abi; }>;


export function getContractInfo(contractKey: ContractKeys, chain: ChainKeys) {
  return {
    address: contracts[contractKey]["address"][chain],
    abi: contracts[contractKey].abi,
    chainId: chain,
  };
}
