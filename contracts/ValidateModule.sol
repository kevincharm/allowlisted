// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "lens-protocol/contracts/interfaces/IFollowNFT.sol";
import "lens-protocol/contracts/interfaces/ILensHub.sol";
import "lens-protocol/contracts/libraries/DataTypes.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

contract ValidateModule{

    ILensHub immutable s_lensHub;
    uint256 neededFollower;

    constructor(ILensHub lensHub){
        
        s_lensHub = lensHub;
        neededFollower = 10;

    }

    function validateFollower(uint256 _winnersProfile)  external returns(bool){

        //Get the FollowerNFT of the Winner
        DataTypes.ProfileStruct memory profile = s_lensHub.getProfile(
            _winnersProfile
        );
        IERC721Enumerable erc721FollowNFT = IERC721Enumerable(
            profile.followNFT
        );

        //Get the Amount of FollowerNFTs

        uint256 totalSupply = erc721FollowNFT.totalSupply();

        //If amount>x return bool true/false

        return totalSupply>=neededFollower;
        
    }


}