const { expect } = require('chai');
const { ethers } = require('hardhat');

const contractName = "Meridian";

// first encoding
const traitEncoding = '100101110010010100011000100011100000110001';
const encoding = parseInt(traitEncoding, 2);

// second encoding
const traitEncoding2 = '011001110010010100010000100011100000110000';
const encoding2 = parseInt(traitEncoding2, 2);



const traitEncodingForFounderTest = '100001110010010100011000100011100000110001';
const founderEncodingTest = parseInt(traitEncodingForFounderTest, 2);

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

        await expect(mintable.mint(encoding)).to.be.reverted;
    });

    it("Should revert mint when ether amount is not enough", async function () {
        const mintable = await deployContract();
        await expect(mintable.mint(encoding, {value: ethers.utils.parseEther("0.0001")})).to.be.reverted;
    });

    it("Should increase mintedNFTs when mint happens", async function () {
        const mintable = await deployContract();
        await mintable.mint(encoding, {value: ethers.utils.parseEther("1.0")});

        expect(await mintable.availableTokens()).to.equal(9999);
    });

    it("Should revert transaction when wallet exceedes amount of mint", async function () {
        const mintable = await deployContract();
        for (i = 0;i < 9;i++) {
            await mintable.mint(encoding2 + i, {value: ethers.utils.parseEther("1.0")});
        }

        expect(await mintable.availableTokens()).to.equal(9991);
        await expect(mintable.mint(encoding + 10, {value: ethers.utils.parseEther("1.0")})).to.be.reverted;

    });

    it("Should increase address balance after sucessful mint", async function() {
        const mintable = await deployContract();
        await mintable.mint(encoding, {value: ethers.utils.parseEther("1.0")});

        expect(Number(ethers.utils.formatUnits(await mintable.contractBalance()))).to.equal(1.0);
    });

    it("Should emit Transfer event when token is minted", async function() {
        const mintable = await deployContract();
        await expect(
            mintable.mint(encoding, {value: ethers.utils.parseEther("1.0")}))
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
        await mintable.mint(encoding, {value: ethers.utils.parseEther("1.0")});
        expect(await mintable.tokenURI(tokenId)).to.equal(baseURI + tokenId);
    });

    it("Should revert free mint if minter is not in mint list", async function() {
        const mintable = await deployContract();
        await expect(mintable.freeMint(encoding)).to.be.reverted;
    });

    it("Should free mint if minter is in mint list", async function() {
        const [deployer] = await ethers.getSigners();

        const mintable = await deployContract();
        await mintable.setFreeMinter(deployer.address);
        await mintable.freeMint(encoding);

        expect(await mintable.availableTokens()).to.equal(9999);
        
    });

    it("Should revert mint if presale is active and sent value is low", async function() {
        const mintable = await deployContract();
        await mintable.setPreSaleActive(true);

        await expect(mintable.mint(encoding, {value: ethers.utils.parseEther("0.05")})).to.be.reverted;
    });

    it("Should return last token id of minter", async function() {
        const [deployer] = await ethers.getSigners();
        const mintable = await deployContract();

        await mintable.mint(encoding2 + 1, {value: ethers.utils.parseEther("1.0")});
        await mintable.mint(encoding2 + 2, {value: ethers.utils.parseEther("1.0")});
        await mintable.mint(encoding2 + 3, {value: ethers.utils.parseEther("1.0")});

        tokenId = await mintable.tokenForWallet(deployer.address);
        expect(ethers.BigNumber.from(tokenId)).to.equal(2);
    });

    it("Should increment trait maps when mint happens", async function() {
        const mintable = await deployContract();
        await mintable.mint(encoding, {value: ethers.utils.parseEther("0.07")});

        const background = await mintable.backgroundMap(7);
        const hand = await mintable.handMap(6);
        const boots = await mintable.bootsMap(3);
        const legs = await mintable.legsMap(2);
        const chest = await mintable.chestMap(17);
        const head = await mintable.headMap(9);
        const group = await mintable.groupMap(4);

        // check for 0
        const non_existing_background = await mintable.backgroundMap(2);

        expect(background.toNumber()).to.equal(1);
        expect(hand.toNumber()).to.equal(1);
        expect(boots.toNumber()).to.equal(1);
        expect(legs.toNumber()).to.equal(1);
        expect(chest.toNumber()).to.equal(1);
        expect(head.toNumber()).to.equal(1);
        expect(group.toNumber()).to.equal(1);

        expect(non_existing_background.toNumber()).to.equal(0);
    });

    it("Should save trait combination when mint happens", async function() {
        const mintable = await deployContract();
        await mintable.mint(encoding, {value: ethers.utils.parseEther("0.07")});

        expect(await mintable.tokenTraits(0)).to.exist;
    });

    it("Should create founder on every 10th mint", async function() {
        const mintable = await deployContract();

        // for the sake of test
        await mintable.setMaximumTokensPerWallet(15);
        
        await mintable.mint(founderEncodingTest, {value: ethers.utils.parseEther("0.07")});

        const foundersAfterFirstMint = await mintable.founders();
        const founderFlagAfterFirstMint = await mintable.founder(0);

        expect(foundersAfterFirstMint).to.equal(0);
        expect(founderFlagAfterFirstMint.toNumber()).to.equal(0);

        for(i = 0; i < 9; i++) {
            await mintable.mint(encoding2 + i, {value: ethers.utils.parseEther("0.07")});
        }

        const founders = await mintable.founders();
        const founderFlag = await mintable.founder(9);

        expect(founders).to.equal(1);
        expect(founderFlag.toNumber()).to.equal(1);
    });

    // Potential trait encoding test

    // it("Should return correct value", async function() {
    //     const mintable = await deployContract();
    //     const encoding = parseInt(traitEncoding, 2);
    //     const res = await mintable.groupTraitIndex(encoding);

    //     expect(res.toNumber()).to.equal(4);
    // });
});