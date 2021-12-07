// SPDX-License-Identifier: MIT

// TODO: 
// 1. freeMint [Done]
// 2. tokenId++ [Done]
// 3. map mapping walletAddr to tokenId [Done]
// 4. function for getting tokenId based on walletAddr [Done]
// 5. safeTransfer function for token transfer + approve [Done]
// 6. map for rarity combination -> map for each trait = 6 maps with counters
// 7. handle presale [Done]

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Meridian is ERC721, Ownable {
    string public baseMetadataURI;

    uint256 public preSaleNFTs = 2500;
    uint256 public preSaleMaxTokens = 5;
    uint256 public preSaleCost = 0.06 ether;

    uint256 public availableNFTs = 10000;
    uint256 public mintedNFTs = 0;
    uint256 public maxTokensPerWallet = 8;
    uint256 public cost = 0.07 ether;

    uint16 public tokenId;
    bool public preSaleActive;
    mapping(address => uint8) public freeMintAddr;
    mapping(address => uint16) public walletToToken;

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

    function tokenForWallet(address wallet) public view returns (uint256) {
        return walletToToken[wallet];
    }

    function setFreeMinter(address minter) public onlyOwner {
        freeMintAddr[minter] = 1;
    }

    function setMetadataBaseURI(string memory _newMetadataURI) public onlyOwner {
        baseMetadataURI = _newMetadataURI;
    }

    function setPreSaleActive(bool active) public onlyOwner {
        preSaleActive = active;
    }

    function mint() external payable {
        uint8 mintAmount = 1;

        if (preSaleActive) {
            require(mintedNFTs + mintAmount <= preSaleNFTs, "Maximum available NFTs for presale exceeded.");
            require(balanceOf(msg.sender) <= preSaleMaxTokens, "Maximum tokens to mint reached for presale.");

            require(msg.value >= preSaleCost * mintAmount, "Not enough funds to mind token.");
        } else {
            require(mintedNFTs + mintAmount <= availableNFTs, "Maximum available NFTs exceeded.");
            require(balanceOf(msg.sender) <= maxTokensPerWallet, "Maximum tokens to mint reached.");

            require(msg.value >= cost * mintAmount, "Not enough funds to mind token.");
        }

        _safeMint(msg.sender, tokenId);
        walletToToken[msg.sender] = tokenId;
        mintedNFTs++;
        tokenId++;
    }

    function freeMint() external {
        if (freeMintAddr[msg.sender] == 0) {
            revert();
        }

        uint8 mintAmount = 1;
        require(mintedNFTs + mintAmount <= availableNFTs, "Maximum available NFTs exceeded.");
        require(balanceOf(msg.sender) <= maxTokensPerWallet, "Maximum tokens to mint reached.");
        _safeMint(msg.sender, tokenId);
        walletToToken[msg.sender] = tokenId;
        mintedNFTs++;
        tokenId++;
    }

    function contractBalance() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }
}