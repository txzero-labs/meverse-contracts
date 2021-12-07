const { expect } = require('chai');
const { ethers } = require('hardhat');

const contractName = "Meridian";

async function deployContract() {
    const MeVerse = await ethers.getContractFactory(contractName);

    const name = 'TestOwner';
    const symbol = 'TO';
    const baseURI = "https://test.io/";

    const mintable = await MeVerse.deploy(name, symbol, baseURI);
    return mintable;
}

describe("Meridian contract tests", function (){

    it("Should be owned by the deployer", async function () {
        const [deployer] = await ethers.getSigners();

        const mintable = await deployContract();
        expect(await mintable.owner()).to.equal(deployer.address);
    });

    it("Should revert mint when transfer amount is not specified", async function () {
        const mintable = await deployContract();
        await expect(mintable.mint()).to.be.reverted;
    });

    it("Should revert mint when ether amount is not enough", async function () {
        const mintable = await deployContract();
        await expect(mintable.mint({value: ethers.utils.parseEther("0.0001")})).to.be.reverted;
    });

    it("Should increase mintedNFTs when mint happens", async function () {
        const mintable = await deployContract();
        await mintable.mint({value: ethers.utils.parseEther("1.0")});

        expect(await mintable.availableTokens()).to.equal(9999);
    });

    it("Should revert transaction when wallet exceedes amount of mint", async function () {
        const mintable = await deployContract();
        for (i = 0;i < 9;i++) {
            await mintable.mint({value: ethers.utils.parseEther("1.0")});
        }

        expect(await mintable.availableTokens()).to.equal(9991);
        await expect(mintable.mint({value: ethers.utils.parseEther("1.0")})).to.be.reverted;

    });

    it("Should increase address balance after sucessful mint", async function() {
        const mintable = await deployContract();
        await mintable.mint({value: ethers.utils.parseEther("1.0")});

        expect(Number(ethers.utils.formatUnits(await mintable.contractBalance()))).to.equal(1.0);
    });

    it("Should emit Transfer event when token is minted", async function() {
        const mintable = await deployContract();
        await expect(
            mintable.mint({value: ethers.utils.parseEther("1.0")}))
                    .to
                    .emit(mintable, "Transfer");

    });

    it("Should revert tokenURI call when tokenId doesn't exist", async function() {
        const tokenId = 0;
        const mintable = await deployContract();
        await expect(mintable.tokenURI(tokenId)).to.be.reverted;
    });

    it("Should return tokenURI when tokenId is exists", async function() {
        const tokenId = 0;
        const baseURI = 'https://test.io/'
        const mintable = await deployContract();
        await mintable.mint({value: ethers.utils.parseEther("1.0")});
        expect(await mintable.tokenURI(tokenId)).to.equal(baseURI + tokenId);
    });

    it("Should revert free mint if minter is not in mint list", async function() {
        const mintable = await deployContract();
        await expect(mintable.freeMint()).to.be.reverted;
    });

    it("Should free mint if minter is in mint list", async function() {
        const [deployer] = await ethers.getSigners();

        const mintable = await deployContract();
        await mintable.setFreeMinter(deployer.address);
        await mintable.freeMint();

        expect(await mintable.availableTokens()).to.equal(9999);
        
    });

    it("Should revert mint if presale is active and sent value is low", async function() {
        const mintable = await deployContract();
        await mintable.setPreSaleActive(true);

        await expect(mintable.mint({value: ethers.utils.parseEther("0.05")})).to.be.reverted;
    });

    it("Should return last token id of minter", async function() {
        const [deployer] = await ethers.getSigners();
        const mintable = await deployContract();

        await mintable.mint({value: ethers.utils.parseEther("1.0")});
        await mintable.mint({value: ethers.utils.parseEther("1.0")});
        await mintable.mint({value: ethers.utils.parseEther("1.0")});

        tokenId = await mintable.tokenForWallet(deployer.address);
        expect(ethers.BigNumber.from(tokenId)).to.equal(2);
    });
});