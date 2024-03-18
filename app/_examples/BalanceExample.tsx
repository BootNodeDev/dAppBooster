import { ContractKeys, getContractInfo } from "@/app/_constants/contracts";
import { mainnet } from "viem/chains";
import { useReadContract } from "wagmi";

export default function ERC20BalanceExample() {
  const daiInfo = getContractInfo(ContractKeys.DAI, mainnet.id);
  const res = useReadContract({
    chainId: mainnet.id,
    address: daiInfo.address,
    abi: daiInfo.abi,
    functionName: "balanceOf",
    args: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
  });

  return <div>{res.data?.toString()}</div>;
}