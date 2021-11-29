const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("MeVerse contract tests", function (){

    it("Should be owned by the deployer", async function () {
        const [deployer] = await ethers.getSigners();

        const MeVerse = await ethers.getContractFactory('MeVerse');

        const name = 'TestOwner';
        const symbol = 'TO';
        const baseURI = "https://test.io/";

        const mintable = await MeVerse.deploy(name, symbol, baseURI);

        expect(await mintable.owner()).to.equal(deployer.address);

    });

    it("Should revert mint when transfer amount is not specified", async function () {
        const [deployer] = await ethers.getSigners();

        const MeVerse = await ethers.getContractFactory('MeVerse');

        const name = 'TestOwner';
        const symbol = 'TO';
        const baseURI = "https://test.io/";
        const tokenId = 1;

        const mintable = await MeVerse.deploy(name, symbol, baseURI);
        await expect(mintable.mint(tokenId, 2)).to.be.reverted;
    });

    it("Should revert mint when amount is higher then 1", async function () {
        const [deployer] = await ethers.getSigners();

        const MeVerse = await ethers.getContractFactory('MeVerse');

        const name = 'TestOwner';
        const symbol = 'TO';
        const baseURI = "https://test.io/";
        const tokenId = 1;

        const mintable = await MeVerse.deploy(name, symbol, baseURI);
        await expect(mintable.mint(tokenId, 2, {value: ethers.utils.parseEther("1.0")})).to.be.reverted;
    });

    it("Should revert mint when ether amount is not enough", async function () {
        const [deployer, _fakeIMX] = await ethers.getSigners();

        const MeVerse = await ethers.getContractFactory('MeVerse');

        const name = 'TestOwner';
        const symbol = 'TO';
        const baseURI = "https://test.io/";


        const mintable = await MeVerse.deploy(name, symbol, baseURI);
        await expect(mintable.mint(1, 1, {value: ethers.utils.parseEther("0.0001")})).to.be.reverted;
    });

    it("Should increase mintedNFTs when mint happens", async function () {
        const [deployer] = await ethers.getSigners();

        const MeVerse = await ethers.getContractFactory('MeVerse');

        const name = 'TestOwner';
        const symbol = 'TO';
        const baseURI = "https://test.io/";
        const tokenId = 1;


        const mintable = await MeVerse.deploy(name, symbol, baseURI);
        await mintable.mint(tokenId, 1, {value: ethers.utils.parseEther("1.0")});

        expect(await mintable.availableTokens()).to.equal(9999);

    });

    it("Should revert transaction when wallet exceedes amount of mint", async function () {
        const [deployer] = await ethers.getSigners();

        const MeVerse = await ethers.getContractFactory('MeVerse');

        const name = 'TestOwner';
        const symbol = 'TO';
        const baseURI = "https://test.io/";


        const mintable = await MeVerse.deploy(name, symbol, baseURI);
        for (i = 0;i < 11;i++) {
            await mintable.mint(i + 1, 1, {value: ethers.utils.parseEther("1.0")});
        }

        expect(await mintable.availableTokens()).to.equal(9989);
        await expect(mintable.mint(12, 1, {value: ethers.utils.parseEther("1.0")})).to.be.reverted;

    });

    it("Should increase address balance after sucessful mint", async function() {
        const [deployer] = await ethers.getSigners();

        const MeVerse = await ethers.getContractFactory('MeVerse');

        const name = 'TestOwner';
        const symbol = 'TO';
        const baseURI = "https://test.io/";
        const tokenId = 1;


        const mintable = await MeVerse.deploy(name, symbol, baseURI);
        await mintable.mint(tokenId, 1, {value: ethers.utils.parseEther("1.0")});

        expect(Number(ethers.utils.formatUnits(await mintable.contractBalance()))).to.equal(1.0);
    });

    it("Should emit Transfer event when token is minted", async function() {
        const [deployer] = await ethers.getSigners();

        const MeVerse = await ethers.getContractFactory('MeVerse');

        const name = 'TestOwner';
        const symbol = 'TO';
        const baseURI = "https://test.io/";
        const tokenId = 1;


        const mintable = await MeVerse.deploy(name, symbol, baseURI);
        await expect(
            mintable.mint(tokenId, 1, {value: ethers.utils.parseEther("1.0")}))
                    .to
                    .emit(mintable, "Transfer");

    });

    it("Should revert tokenURI call when tokenId doesn't exist", async function() {
        const [deployer] = await ethers.getSigners();

        const MeVerse = await ethers.getContractFactory('MeVerse');

        const name = 'TestOwner';
        const symbol = 'TO';
        const baseURI = "https://test.io/";
        const tokenId = 1;

        const mintable = await MeVerse.deploy(name, symbol, baseURI);
        await expect(mintable.tokenURI(tokenId)).to.be.reverted;
    });

    it("Should return tokenURI when tokenId is exists", async function() {
        const [deployer] = await ethers.getSigners();

        const MeVerse = await ethers.getContractFactory('MeVerse');

        const name = 'TestOwner';
        const symbol = 'TO';
        const baseURI = "https://test.io/";
        const tokenId = 1;


        const mintable = await MeVerse.deploy(name, symbol, baseURI);
        await mintable.mint(tokenId, 1, {value: ethers.utils.parseEther("1.0")});
        expect(await mintable.tokenURI(tokenId)).to.equal(baseURI + tokenId);
    });
});