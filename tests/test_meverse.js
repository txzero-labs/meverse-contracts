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
    const [deployer] = await ethers.getSigners();
    const MeVerse = await ethers.getContractFactory(contractName);

    const name = 'TestOwner';
    const symbol = 'TO';
    const baseURI = "https://test.io/";

    const mintable = await MeVerse.deploy(name, symbol, baseURI, [deployer.address]);
    await mintable.setPreSaleActive(false);
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
        for (i = 0;i < 8;i++) {
            await mintable.mint(encoding2 + i, {value: ethers.utils.parseEther("1.0")});
        }

        expect(await mintable.availableTokens()).to.equal(9992);
        await expect(mintable.mint(encoding + 9, {value: ethers.utils.parseEther("1.0")})).to.be.reverted;

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

    it("Should return if wallet is in free minter list", async function() {
        const [deployer] = await ethers.getSigners();

        const mintable = await deployContract();
        expect(await mintable.freeMintAddr(deployer.address)).to.equal(1);
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
        const accessories = await mintable.accessoriesMap(8);

        // check for 0
        const non_existing_background = await mintable.backgroundMap(2);

        expect(background.toNumber()).to.equal(1);
        expect(hand.toNumber()).to.equal(1);
        expect(boots.toNumber()).to.equal(1);
        expect(legs.toNumber()).to.equal(1);
        expect(chest.toNumber()).to.equal(1);
        expect(head.toNumber()).to.equal(1);
        expect(group.toNumber()).to.equal(1);
        expect(accessories.toNumber()).to.equal(1);

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

    it("Should revert transaction if existing combination exists", async function() {
        const mintable = await deployContract();

        await mintable.mint(encoding, {value: ethers.utils.parseEther("0.07")});

        await expect(mintable.mint(encoding, {value: ethers.utils.parseEther("0.07")})).to.be.reverted;
    });

    it ("Should revert transaction if right hand combination is invalid", async function() {
        const mintable = await deployContract();

        const group1pose1 = '000101110010010100010100100011100000110111';
        const firstEncoding = parseInt(group1pose1, 2);
        await expect(mintable.mint(firstEncoding, {value: ethers.utils.parseEther("0.07")})).to.be.reverted;

        const group0pose2 = '000101110010010100011000100011100000110111';
        const secondEncoding = parseInt(group0pose2, 2);
        await expect(mintable.mint(secondEncoding, {value: ethers.utils.parseEther("0.07")})).to.be.reverted;

        const group1pose2 = '001101110010010100011000100011100000110111';
        const thirdEncoding = parseInt(group1pose2, 2);
        await expect(mintable.mint(thirdEncoding, {value: ethers.utils.parseEther("0.07")})).to.be.reverted;

        const group2pose2 = '010101110010010100011000100011100000110111';
        const fourthEncoding = parseInt(group2pose2, 2);
        await expect(mintable.mint(fourthEncoding, {value: ethers.utils.parseEther("0.07")})).to.be.reverted;

        const group3pose1 = '011101110010010100010100100011100000110111';
        const fifthEncoding = parseInt(group3pose1, 2);
        await expect(mintable.mint(fifthEncoding, {value: ethers.utils.parseEther("0.07")})).to.be.reverted;

        const group3pose2 = '011101110010010100011000100011100000110111';
        const sixthEncoding = parseInt(group3pose2, 2);
        await expect(mintable.mint(sixthEncoding, {value: ethers.utils.parseEther("0.07")})).to.be.reverted;

        const group4pose2 = '100101110010010100011000100011100000110111';
        const seventhEncoding = parseInt(group4pose2, 2);
        await expect(mintable.mint(seventhEncoding, {value: ethers.utils.parseEther("0.07")})).to.be.reverted;
    });

    it ("Should transfer contract balance", async function() {
        const mintable = await deployContract();
        await mintable.mint(encoding, {value: ethers.utils.parseEther("0.07")});
        const balance = await mintable.contractBalance();

        await mintable.withdraw();
        const newBalance = await mintable.contractBalance();
        expect(newBalance).to.equal(0);
    });
});