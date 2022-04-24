// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import {IFollowNFT} from "lens-protocol/contracts/interfaces/IFollowNFT.sol";
import {ILensHub} from "lens-protocol/contracts/interfaces/ILensHub.sol";
import {DataTypes} from "lens-protocol/contracts/libraries/DataTypes.sol";
import {IERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import {IValidateModule} from "./IValidateModule.sol";

/**
 * @title MinFollowersValidateModule
 * @notice A ValidateModule for Allowlister that requires a user to have a configured minimum
 *      number of followers in order to register for an allowlist raffle.
 */
contract MinFollowersValidateModule is IValidateModule {
    ILensHub public immutable lensHub;
    uint256 public immutable minimumFollowers;

    constructor(ILensHub lensHub_, uint256 minimumFollowers_) {
        lensHub = lensHub_;
        minimumFollowers = minimumFollowers_;
    }

    function validate(uint256 profileId) external view returns (bool) {
        // Get the FollowerNFT of the Winner
        DataTypes.ProfileStruct memory profile = lensHub.getProfile(profileId);
        IERC721Enumerable erc721FollowNFT = IERC721Enumerable(
            profile.followNFT
        );

        // Get the number of followers for this profile ID
        uint256 totalSupply = erc721FollowNFT.totalSupply();
        return totalSupply >= minimumFollowers;
    }
}
