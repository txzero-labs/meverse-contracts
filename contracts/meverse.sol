// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MeVerse is ERC721, Ownable {
    string public baseMetadataURI;
    uint256 public availableNFTs = 10000;
    uint256 public mintedNFTs = 0;
    uint256 public maxTokensPerWallet = 10;
    uint256 public cost = 0.073 ether;

    constructor(
        string memory _collectionName, 
        string memory _collectionSymbol, 
        string memory _initMetadataURI
        ) ERC721(_collectionName, _collectionSymbol) {
            baseMetadataURI = _initMetadataURI;
        }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseMetadataURI;
    }

    function availableTokens() public view returns (uint256) {
        return availableNFTs - mintedNFTs;
    }

    function setMetadataBaseURI(string memory _newMetadataURI) public onlyOwner {
        baseMetadataURI = _newMetadataURI;
    }

    function mint(uint256 id, uint256 mintAmount) public payable onlyOwner {
        require(mintAmount == 1, "Only 1 NFT can be minted.");

        require(mintedNFTs + mintAmount <= availableNFTs, "Maximum available NFTs exceeded.");
        require(balanceOf(msg.sender) <= maxTokensPerWallet, "Maximum tokens to mint reached.");

        require(msg.value >= cost * mintAmount, "Not enough funds to mind token.");
        _safeMint(msg.sender, id);
        mintedNFTs++;
    }

    function contractBalance() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }
}