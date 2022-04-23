// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import {IFollowNFT} from "lens-protocol/contracts/interfaces/IFollowNFT.sol";
import {ILensHub} from "lens-protocol/contracts/interfaces/ILensHub.sol";
import {DataTypes} from "lens-protocol/contracts/libraries/DataTypes.sol";
import {IERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IRandomiserCallback} from "./IRandomiserCallback.sol";
import {Randomiser} from "./Randomiser.sol";
import {IValidateModule} from "./IValidateModule.sol";
import {IWinnersModule} from "./IWinnersModule.sol";

/**
 * @title Allowlister
 * @notice Contract that allows Lens users to register for an allowlist, then draws
 *      n random winners for the allowlist.
 */
contract Allowlister is IRandomiserCallback, Ownable {
    /// @notice The LensHub contract
    ILensHub public immutable lensHub;

    /// @notice The `Randomiser` contract implementing the randomisation logic.
    Randomiser public immutable randomiser;

    /// @notice Lens profile ID containing the list of followers to draw the raffle from.
    uint256 public immutable raffleProfileId;

    /// @notice Number of winners left to draw from the raffle.
    uint256 public immutable winnersToDraw;

    /// @notice The contract implementing `IWinnersModule` that determines the logic
    ///     for handling what happens with the winner addresses.
    IWinnersModule public immutable winnersModule;

    /// @notice The contract implementing `IValidateMOdule` that determines that logic
    ///     for handling validation of each follower after they are drawn during the raffle.
    IValidateModule public immutable validateModule;

    /// @dev Profile IDs registered for raffle. This is the array from which random winners are picked.
    uint256[] public s_registeredIds;

    /// @dev Addresses corresponding to registered profile IDs.
    mapping(uint256 => address) public s_registeredAddresses;

    /// @dev Determines whether profile ID has already registered for raffle
    mapping(uint256 => bool) public s_profileIdRegistered;

    /// @dev Determines whether address has already registered for raffle
    mapping(address => bool) public s_addressRegistered;

    /// @dev The current random number (changes every time a random number is requested)
    uint256 public s_randomState;

    /// @notice Flag determining if raffle is already completed
    bool public s_isRaffleFinished = false;

    /// @notice Event emitted when a winner is drawn from the raffle.
    event RaffleDrawn(uint256 indexed profileId);

    constructor(
        ILensHub lensHub_,
        string memory projectLensHandle,
        uint256 winnersToDraw_,
        Randomiser randomiser_,
        IWinnersModule winnersModule_,
        IValidateModule validateModule_
    ) Ownable() {
        lensHub = lensHub_;
        raffleProfileId = lensHub.getProfileIdByHandle(projectLensHandle);
        winnersToDraw = winnersToDraw_;
        randomiser = randomiser_;
        winnersModule = winnersModule_;
        validateModule = validateModule_;
    }

    /**
     * @notice Executes the raffle, picking random winners from the `ids` array.
     */
    function raffle() public {
        require(!s_isRaffleFinished, "Raffle already finished");
        DataTypes.ProfileStruct memory profile = lensHub.getProfile(
            raffleProfileId
        );
        IERC721Enumerable erc721FollowNFT = IERC721Enumerable(
            profile.followNFT
        );
        uint256 totalSupply = erc721FollowNFT.totalSupply();
        require(totalSupply >= winnersToDraw, "Not enough supply for raffle");

        uint256[] memory winnerProfileIds = new uint256[](winnersToDraw);
        uint256 winnerCount = 0;

        // Load array of registered profile IDs into mem.
        uint256[] memory registeredIds = s_registeredIds;

        bool hasWinnersModule = address(winnersModule) != address(0);

        for (uint256 i = 0; i < winnersToDraw; i++) {
            uint256 randomIndex = getNextRandomNumber() % (winnersToDraw - i);
            uint256 drawnProfileId = s_registeredIds[randomIndex];

            winnerProfileIds[winnerCount++] = drawnProfileId;
            emit RaffleDrawn(drawnProfileId);

            // Invoke winners module side-effects
            if (hasWinnersModule) {
                address winner = s_registeredAddresses[drawnProfileId];
                require(winner != address(0), "Mint to zero address");
                winnersModule.mintWhitelistToken(winner);
            }

            // Remove ID from possible domain of IDs, so they can't be drawn again
            registeredIds[randomIndex] = registeredIds[
                registeredIds.length - 1
            ];
            delete registeredIds[registeredIds.length - 1];
        }

        s_registeredIds = registeredIds;
        s_isRaffleFinished = true;
    }

    /**
     * @notice Register for a raffle as the default Lens profile of the current EOA.
     */
    function register() external {
        uint256 profileId = lensHub.defaultProfile(msg.sender);
        require(
            !s_profileIdRegistered[profileId] &&
                !s_addressRegistered[msg.sender],
            "Already registered for raffle"
        );
        // Mark profile ID & address as registered
        s_profileIdRegistered[profileId] = true;
        s_addressRegistered[msg.sender] = true;

        // Ensure user registering for raffle passes validation
        // This is where the validation module would check for this profile's
        // follower count, publication count, or timestamp of follow.
        require(
            validateModule.validateFollower(profileId),
            "Profile validation failed"
        );
        s_registeredIds.push(profileId);
        s_registeredAddresses[profileId] = msg.sender;
    }

    /**
     * @notice Get the next random number using current seed.
     */
    function getNextRandomNumber() private returns (uint256 randomNumber) {
        uint256 randomState = s_randomState;
        require(randomState != 0, "Initialise random seed first");
        randomNumber = randomState;
        s_randomState = uint256(
            keccak256(abi.encode(randomState, block.difficulty))
        );
    }

    /**
     * @notice Request a random number from the Randomiser contract.
     */
    function getRandomNumber() external onlyOwner {
        require(s_randomState == 0, "Randomness has already been set");
        randomiser.getRandomNumber(address(this));
    }

    /**
     * @dev Callback implementing `IRandomiserCallback`, sets the random seed.
     *      Reverts if seed has already been set.
     */
    function receiveRandomness(uint256 randomness) external {
        require(msg.sender == address(randomiser), "Only randomiser may call");
        require(s_randomState == 0, "Randomness has already been set");
        s_randomState = randomness;
    }
}
