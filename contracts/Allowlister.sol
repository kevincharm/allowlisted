//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.10;

import "hardhat/console.sol";
import "lens-protocol/contracts/interfaces/IFollowNFT.sol";
import "lens-protocol/contracts/interfaces/ILensHub.sol";
import "lens-protocol/contracts/libraries/DataTypes.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IRandomiserCallback} from "./IRandomiserCallback.sol";
import {Randomiser} from "./Randomiser.sol";

contract Allowlister is IRandomiserCallback, Ownable {
    ILensHub immutable s_lensHub;
    Randomiser immutable s_randomiser;
    uint256 immutable s_profileId;
    uint256 immutable s_numberToRaffle;
    uint256[] ids;
    bool isRaffleFinished = false;
    uint256 s_randomState;

    event RaffleDrawn(uint256 indexed profileId);

    constructor(
        ILensHub lensHub,
        string memory projectLensHandle,
        uint256 numberToRaffle,
        Randomiser randomiser
    ) Ownable() {
        s_lensHub = lensHub;
        s_profileId = lensHub.getProfileIdByHandle(projectLensHandle);
        s_numberToRaffle = numberToRaffle;
        s_randomiser = randomiser;
    }

    function raffle() public {
        uint256 numberToRaffle = s_numberToRaffle;
        DataTypes.ProfileStruct memory profile = s_lensHub.getProfile(
            s_profileId
        );
        IERC721Enumerable erc721FollowNFT = IERC721Enumerable(
            profile.followNFT
        );
        uint256 totalSupply = erc721FollowNFT.totalSupply();
        require(totalSupply >= numberToRaffle);

        for (uint256 i = 0; i < totalSupply; i++) {
            ids.push(i + 1);
        }

        for (uint256 i = 0; i < numberToRaffle; i++) {
            uint256 randomId = getNextRandomNumber();
            uint256 drawnId = ids[randomId];
            emit RaffleDrawn(drawnId);
            ids[randomId] = ids[ids.length - 1];
            delete ids[ids.length - 1];
        }
    }

    // Returns winner
    function getNextRandomNumber() private returns (uint256 randomNumber) {
        require(s_randomState != 0);
        randomNumber = s_randomState;
        s_randomState = uint256(keccak256(abi.encode(s_randomState, 1)));
    }

    /**
     * Request a random number from the Randomiser contract.
     */
    function getRandomNumber() external onlyOwner {
        require(s_randomState == 0, "Randomness has already been set");
        s_randomiser.getRandomNumber(address(this));
    }

    function receiveRandomness(uint256 randomness) external {
        s_randomState = randomness;
    }
}
