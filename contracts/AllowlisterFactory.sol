// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Allowlister} from "./Allowlister.sol";

contract AllowlisterFactory is Ownable {
    uint256 public s_raffleId = 0;
    mapping(uint256 => Allowlister) public raffles;

    constructor() Ownable() {}

    function deploy(
        address lensHub,
        string calldata projectLensHandle,
        uint256 winnersToDraw,
        address randomiser,
        address winnersModule,
        address validateModule
    ) external returns (address, uint256) {
        uint256 raffleId = s_raffleId++;
        Allowlister raffle = new Allowlister(
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
