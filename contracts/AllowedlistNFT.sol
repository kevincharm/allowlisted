pragma solidity ^0.8.10;

import "./IWinnersModule.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AllowedlistNFT is ERC721, Ownable, IWinnersModule {

    constructor() ERC721("AllowedlistNFT", "ANFT") Ownable() {
    }

    function mintWhitelistToken(address winner) external onlyOwner {
        _safeMint(winner);
        return true;
    }

}
