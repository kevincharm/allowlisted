import { expect } from "chai";
import { ethers } from "hardhat";
// eslint-disable-next-line
import { Allowlister__factory, ILensHub__factory } from "../typechain";

describe("Allowlister", () => {
  it("should emit 'RaffleDrawn' on raffle()", async function () {
    const [owner] = await ethers.getSigners();
    const lensHub = ILensHub__factory.connect(
      "0x4BF0c7AD32Fd2d32089790a54485e23f5C7736C0",
      owner
    );
    const Allowlister = await new Allowlister__factory(owner).deploy(
      lensHub.address,
      "alice",
      2,
      owner.address,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero
    );
    await Allowlister.deployed();

    await Allowlister.receiveRandomness(3);
    await expect(Allowlister.raffle()).to.emit(Allowlister, "RaffleDrawn");
  });
});
