// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;


interface IValidateModule{

    function validateFollower(uint256 _winnersProfile)  external returns(bool);
    

}