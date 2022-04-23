pragma solidity ^0.8.10;

import "./IWinnersModule.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AllowedlistNFT is ERC721Enumerable, Ownable, IWinnersModule {
    constructor() ERC721("AllowedlistNFT", "ANFT") Ownable() {}

    function award(address winner) external onlyOwner {
        _safeMint(winner, totalSupply() + 1);
    }
}
