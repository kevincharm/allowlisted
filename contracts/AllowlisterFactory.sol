// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Allowlister} from "./Allowlister.sol";
import {Randomiser} from "./Randomiser.sol";

contract AllowlisterFactory is Ownable {
    address public immutable lensHub;
    Randomiser public immutable randomiser;

    uint256 public s_raffleId = 0;
    mapping(uint256 => Allowlister) public raffles;

    constructor(
        address lensHub_,
        address coordinator_,
        bytes32 keyHash_,
        address linkTokenAddress_
    ) Ownable() {
        lensHub = lensHub_;
        randomiser = new Randomiser(coordinator_, keyHash_, linkTokenAddress_);
    }

    function transferRandomiserOwnership(address to) external onlyOwner {
        randomiser.transferOwnership(to);
    }

    function createRaffle(
        string calldata projectLensHandle,
        string calldata raffleDisplayName,
        uint256 winnersToDraw,
        address winnersModule,
        address validateModule
    ) external returns (address, uint256) {
        uint256 raffleId = s_raffleId++;
        Allowlister raffle = new Allowlister(
            raffleDisplayName,
            lensHub,
            projectLensHandle,
            winnersToDraw,
            address(randomiser),
            winnersModule,
            validateModule
        );
        // Transfer ownership of raffle to account that created raffle
        raffle.transferOwnership(msg.sender);
        raffles[raffleId] = raffle;
        // Authorise newly-deployed raffle contract on the randomiser
        randomiser.authorise(address(raffle));
        return (address(raffle), raffleId);
    }
}
