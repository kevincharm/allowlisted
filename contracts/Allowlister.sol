//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.10;

import "hardhat/console.sol";
import "lens-protocol/contracts/interfaces/IFollowNFT.sol";
import "lens-protocol/contracts/interfaces/ILensHub.sol";
import "lens-protocol/contracts/libraries/DataTypes.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Allowlister {
    DataTypes.ProfileStruct immutable profile;
    uint256 immutable numberToRaffle;
    uint256[] ids;
    bool isRaffleFinished = false;

    event RaffleDraw(uint256 indexed profileId);

    constructor(string memory _projectLensHandle, uint256 numberToRaffle) {
         profile = ILensHub.getProfile(ILensHub.getProfileIdByHandle(projectLensHandle));
    }

    // Returns winner
    function getNextRandomNumber() private  returns (uint256){
        return 42;
    }

    function raffle() public {
        uint256 randomId = getNextRandomNumber();
        IERC721 erc721FollowNFT = IERC721(profile.followNFT);
        uint256 totalSupply = erc721FollowNFT.totalSupply();
        require(totalSupply >= numberToRaffle);

        for (uint256 i = 0; i < totalSupply; i++) {
            ids.push(i + 1);
        }

        for (uint256 i = 0; i < numberToRaffle; i++) {
            uint256 randomId = getNextRandomNumber();
            uint256 drawnId = ids[randomId];
            ids[randomId] = ids[ids.length - 1];
            delete ids[ids.length - 1];
        }
    }
}
