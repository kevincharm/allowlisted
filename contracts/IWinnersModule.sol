// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;


interface IWinnersModule{

    function mintWhitelistToken(uint256 _winnersProfile)  external returns(bool);
    

}