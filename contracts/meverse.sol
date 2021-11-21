// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@imtbl/imx-contracts/contracts/Mintable.sol";

contract MeVerse is ERC721, Mintable {

    string public baseMetadataURI;
    uint256 public availableNFTs;
    uint256 public mintedNFTs;
    uint256 public maxTokensPerWallet;

    constructor(
        address _ownerAddress, 
        string memory _collectionName, 
        string memory _collectionSymbol, 
        address _imxAddress,
        string memory _initMetadataURI
        ) ERC721(_collectionName, _collectionSymbol) Mintable(_ownerAddress, _imxAddress) {
            baseMetadataURI = _initMetadataURI;
            availableNFTs = 10000;
            mintedNFTs = 0;
            maxTokensPerWallet = 10;
        }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseMetadataURI;
    }

    /// @notice Count NFTs tracked by this contract.
    /// @return A count of valid NFTs tracked by this contract.
    function totalSupply() public view returns (uint256) {
        return mintedNFTs;
    }

    function availableTokens() public view returns (uint256) {
        return availableNFTs;
    }

    function setMetadataBaseURI(string memory _newMetadataURI) public onlyOwner {
        baseMetadataURI = _newMetadataURI;
    }

    function ownerOf(uint256 tokenId) public override view returns (address) {
        return super.ownerOf(tokenId);
    }

    function balanceOf(address tokenOwner) public override view returns (uint256) {
        return super.balanceOf(tokenOwner);
    }

    /// @notice Mint one NFT to destination address with specified token id.
    function _mintFor(address to, uint256 id, bytes memory blueprint) internal override {
        uint256 supply = totalSupply();
        require(supply <= availableNFTs, "Maximum available NFTs exceeded.");
        require(balanceOf(to) <= maxTokensPerWallet, "Maximum tokens to mint reached.");
        super._safeMint(to, id);
        mintedNFTs++;
    }
}