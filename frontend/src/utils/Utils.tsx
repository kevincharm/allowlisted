import { useSignerOrProvider } from "@hooks/useWeb3React";
import { ethers } from "ethers";
import LensHub from "@abi/LensHub.json";
import AllowlisterFactory from "@abi/AllowlisterFactory.json";
import { useWeb3React } from "@web3-react/core";



export async function getHandle(): Promise<string> {
  const signerOrProvider = useSignerOrProvider();
  const { isActive, account } = useWeb3React();
  if (!account) {
    return "";
  }
  console.log(account);
  const contract = new ethers.Contract(	"0x4BF0c7AD32Fd2d32089790a54485e23f5C7736C0", LensHub.abi, signerOrProvider);
  return contract.defaultProfile(account).then((profileId) => {
    if (!profileId.toNumber() || profileId === "0x00") {
      return "No profile found";
    }
    return contract.getHandle(profileId);
  }).then((x) => {
    console.log(x);
    return x;
  });
}

export async function createRaffle(winnersToDraw: number, name: string): Promise<{deployedAddress: string, raffleId: number}> {
  const handle = await getHandle();
  const signerOrProvider = useSignerOrProvider();
  const contract = new ethers.Contract(	"0x282EACd3a7431308533007FbCa5f9D1c630d2e6C", AllowlisterFactory.abi, signerOrProvider);
  const [deployedAddress, raffleId] = await contract.createRaffle(handle, name, winnersToDraw, ethers.constants.AddressZero, ethers.constants.AddressZero);
  return {deployedAddress, raffleId};
}
