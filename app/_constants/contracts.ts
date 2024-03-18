import ERC_20_abi from "@/app/_constants/abis/ERC20";
import { ChainKeys } from "@/app/_lib/wagmi.config";
import { Abi, Address } from "viem";
import { mainnet, sepolia } from "viem/chains";

export enum ContractKeys {
  DAI = "DAI",
}

export const contracts: Record<
  ContractKeys,
  { address: Record<ChainKeys, Address>; abi: Abi }
> = {
  DAI: {
    address: {
      [mainnet.id]: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      [sepolia.id]: "0x5c221e77624690fff6dd741493d735a17716c26b",
    },
    abi: ERC_20_abi,
  },
} as const;

export function getContractInfo(contractKey: ContractKeys, chain: ChainKeys) {
  return {
    address: contracts[contractKey]["address"][chain],
    abi: contracts[contractKey].abi,
  };
}
