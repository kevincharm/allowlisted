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
import {IValidateModule} from "./IValidateModule.sol";
import {IWinnersModule} from "./IWinnersModule.sol";

contract Allowlister is IRandomiserCallback, Ownable {
    /// @dev Maximum invalid winner count per iteration before transaction exits.
    uint256 public constant MAX_INVALID_COUNT = 10;

    /// @notice The LensHub contract
    ILensHub public immutable s_lensHub;

    /// @notice The `Randomiser` contract implementing the randomisation logic.
    Randomiser immutable s_randomiser;

    /// @notice Lens profile ID containing the list of followers to draw the raffle from.
    uint256 immutable s_profileId;

    /// @notice Number of winners to draw from the raffle.
    uint256 immutable s_numberToRaffle;

    /// @dev Follower token IDs
    uint256[] public ids;

    /// @notice Flag determining if raffle is already completed
    bool public isRaffleFinished = false;

    /// @dev The current random number (changes every time a random number is requested)
    uint256 public s_randomState;

    /// @notice The contract implementing `IWinnersModule` that determines the logic
    ///     for handling what happens with the winner addresses.
    IWinnersModule s_winnersModule;

    /// @notice The contract implementing `IValidateMOdule` that determines that logic
    ///     for handling validation of each follower after they are drawn during the raffle.
    IValidateModule s_validateModule;

    /// @notice Event emitted when a winner is drawn from the raffle.
    event RaffleDrawn(uint256 indexed profileId);

    constructor(
        ILensHub lensHub,
        string memory projectLensHandle,
        uint256 numberToRaffle,
        Randomiser randomiser,
        IWinnersModule winnersModule,
        IValidateModule validateModule
    ) Ownable() {
        s_lensHub = lensHub;
        s_profileId = lensHub.getProfileIdByHandle(projectLensHandle);
        s_numberToRaffle = numberToRaffle;
        s_randomiser = randomiser;
        s_winnersModule = winnersModule;
        s_validateModule = validateModule;
    }

    /**
     * @notice Executes the raffle
     */
    function raffle() public {
        DataTypes.ProfileStruct memory profile = s_lensHub.getProfile(
            s_profileId
        );
        IERC721Enumerable erc721FollowNFT = IERC721Enumerable(
            profile.followNFT
        );
        uint256 totalSupply = erc721FollowNFT.totalSupply();
        require(totalSupply >= s_numberToRaffle);

        for (uint256 i = 0; i < totalSupply; i++) {
            ids.push(i + 1);
        }

        uint256[] memory winnerFollowerIds = new uint256[](s_numberToRaffle);
        uint256[] memory winnerProfileIds = new uint256[](s_numberToRaffle);
        uint256 winnerCount = 0;
        uint256 invalidCount = 0;
        for (uint256 i = 0; i < s_numberToRaffle; i++) {
            uint256 randomId = getNextRandomNumber();
            uint256 drawnId = ids[randomId];
            uint256 drawnProfileId = s_lensHub.defaultProfile(
                erc721FollowNFT.ownerOf(drawnId)
            );

            // Check validity of winner through module, if set
            bool isValid = true;
            if (address(s_validateModule) != address(0)) {
                isValid = s_validateModule.validateFollower(drawnProfileId);
            }

            if (isValid) {
                // Valid winner (or no validity check)
                emit RaffleDrawn(drawnProfileId);
                winnerProfileIds[winnerCount] = drawnProfileId;
                winnerFollowerIds[winnerCount] = drawnId;
                winnerCount += 1;
            } else {
                // Not valid, do another run
                invalidCount += 1;
                i -= 1;
                require(invalidCount <= MAX_INVALID_COUNT);
            }
            // Regardless of winner validity,
            // remove ID from possible domain of IDs.
            ids[randomId] = ids[ids.length - 1];
            delete ids[ids.length - 1];
        }

        if (address(s_winnersModule) != address(0)) {
            // TODO: Change this callback function name
            for (uint256 i = 0; i < winnerFollowerIds.length; i++) {
                address winner = erc721FollowNFT.ownerOf(winnerFollowerIds[i]);
                s_winnersModule.mintWhitelistToken(winner);
            }
        }
    }

    /**
     * @notice Get the next random number using the current seed `s_randomState`.
     *      `s_randomState` must first be initialised.
     */
    function getNextRandomNumber() private returns (uint256 randomNumber) {
        require(s_randomState != 0);
        randomNumber = s_randomState % s_numberToRaffle;
        s_randomState = uint256(
            keccak256(
                abi.encode(
                    s_randomState,
                    blockhash(block.number),
                    block.difficulty
                )
            )
        );
    }

    /**
     * @notice Request a random number from the Randomiser contract.
     */
    function getRandomNumber() external onlyOwner {
        require(s_randomState == 0, "Randomness has already been set");
        s_randomiser.getRandomNumber(address(this));
    }

    /**
     * @dev Callback implementing `IRandomiserCallback`, sets the random seed.
     *      Reverts if seed has already been set.
     */
    function receiveRandomness(uint256 randomness) external {
        require(msg.sender == address(s_randomiser));
        require(s_randomState == 0, "Randomness has already been set");
        s_randomState = randomness;
    }
}
