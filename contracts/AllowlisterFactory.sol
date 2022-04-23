// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Allowlister} from "./Allowlister.sol";

contract AllowlisterFactory is Ownable {
    address public immutable lensHub;
    address public immutable randomiser;

    uint256 public s_raffleId = 0;
    mapping(uint256 => Allowlister) public raffles;

    constructor(address lensHub_, address randomiser_) Ownable() {
        lensHub = lensHub_;
        randomiser = randomiser_;
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
            randomiser,
            winnersModule,
            validateModule
        );
        raffles[raffleId] = raffle;
        s_raffleId = raffleId;
        return (address(raffle), raffleId);
    }
}
