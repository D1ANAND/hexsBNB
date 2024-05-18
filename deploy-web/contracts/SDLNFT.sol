// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
contract NFTMinter is ERC721URIStorage {

    constructor() ERC721("HEXS NFT", "HEXS") {}
    
    uint public tokenId;
    string public tokenUri;

    function setUri(string memory _tokenURI) public {
        tokenUri = _tokenURI;
    }

    function mintNFT(address _to) public returns (uint){
        tokenId++;
        _mint(_to, tokenId);
        _setTokenURI(tokenId, tokenUri);
        return tokenId;
    }
}