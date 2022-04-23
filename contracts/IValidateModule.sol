// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

/**
 * @notice Callback interface for the validate module.
 * @dev A contract implementing this interface will be called with the profile IDs of
 */
interface IValidateModule {
    function validate(uint256 profileId) external returns (bool);
}
