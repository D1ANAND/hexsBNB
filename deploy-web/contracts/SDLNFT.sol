// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// priviledged owner can mint or execute plugins even if he holds 0 nfts
// any owner can mint or execute plugins if her hold nfts

interface Plugin {
    function execute(bytes[] memory _parameters) external;
}

contract SDLNFT is ERC721URIStorage {

    address priviledgedOwner;

    constructor(address _address) ERC721("HEXS NFT", "HEXS") {
        priviledgedOwner = _address;
    }
    
    uint public tokenId;
    string public tokenUri;

    modifier onlyModelOwner() {
        require(balanceOf(msg.sender) > 0 || tx.origin == priviledgedOwner, "");
        _;
    }

    function setUri(string memory _tokenURI) public onlyModelOwner {
        tokenUri = _tokenURI;
    }

    function mintNFT(address _to) public onlyModelOwner returns (uint) {
        tokenId++;
        _mint(_to, tokenId);
        _setTokenURI(tokenId, tokenUri);
        return tokenId;
    }

    function execute(address _plugin, bytes[] memory _parameters) public onlyModelOwner {
        Plugin plugin = Plugin(_plugin);
        plugin.execute(_parameters);
    }
}