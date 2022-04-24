// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import {IFollowNFT} from "lens-protocol/contracts/interfaces/IFollowNFT.sol";
import {ILensHub} from "lens-protocol/contracts/interfaces/ILensHub.sol";
import {DataTypes} from "lens-protocol/contracts/libraries/DataTypes.sol";
import {IERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import {IERC721Time} from "lens-protocol/contracts/core/base/IERC721Time.sol";
import {IValidateModule} from "./IValidateModule.sol";

/**
 * @title MinFollowTimeValidateModule
 * @notice A ValidateModule for Allowlister that requires a user to have followed `rafflerProfileId`
 *      for at least `minimumSeconds`.
 */
contract MinFollowTimeValidateModule is IValidateModule {
    ILensHub public immutable lensHub;
    // TODO: This can be injected from the Allowlist contract
    uint256 public immutable rafflerProfileId;
    uint256 public immutable minimumSeconds;

    constructor(
        ILensHub lensHub_,
        string memory rafflerHandle,
        uint256 minimumSeconds_
    ) {
        lensHub = lensHub_;
        rafflerProfileId = lensHub.getProfileIdByHandle(rafflerHandle);
        minimumSeconds = minimumSeconds_;
    }

    function validate(uint256 profileId) external view returns (bool) {
        // Get the FollowerNFT of the raffler
        DataTypes.ProfileStruct memory profile = lensHub.getProfile(
            rafflerProfileId
        );
        IERC721Enumerable erc721FollowNFTEnum = IERC721Enumerable(
            profile.followNFT
        );
        // Enumerate over all the followers of the raffler to possibly find
        // the profileId being validated.
        for (uint256 i = 0; i < erc721FollowNFTEnum.totalSupply(); i++) {
            if (
                lensHub.defaultProfile(erc721FollowNFTEnum.ownerOf(i)) ==
                profileId
            ) {
                IERC721Time erc721FollowNFT = IERC721Time(profile.followNFT);
                uint256 mintedAt = erc721FollowNFT.mintTimestampOf(i);
                return
                    (block.timestamp > mintedAt) &&
                    ((block.timestamp - mintedAt) >= minimumSeconds);
            }
        }

        return false;
    }
}
