const { expect } = require('chai');
const exp = require('constants');
const { ethers } = require('hardhat');

describe("MeVerse contract tests", function (){

    it("Should not be able to mint from non IMX address", async function () {
        const [owner, _fakeIMX] = await ethers.getSigners();

        const MeVerse = await ethers.getContractFactory('MeVerse');

        const name = 'TestOwner';
        const symbol = "TO";
        const baseURI = "https://test.io";

        const mintable = await MeVerse.deploy(owner.address, name, symbol, _fakeIMX.address, baseURI);

        await expect(mintable.mintFor(owner.address, 1, '')).to.be.reverted;

    });

    it("Should be owned by the deployer", async function () {
        const [deployer, _fakeIMX] = await ethers.getSigners();

        const MeVerse = await ethers.getContractFactory('MeVerse');

        const name = 'TestOwner';
        const symbol = 'TO';
        const baseURI = "https://test.io";

        const mintable = await MeVerse.deploy(deployer.address, name, symbol, _fakeIMX.address, baseURI);

        expect(await mintable.owner()).to.equal(deployer.address);

    });

    it("Should mint token with empty blueprint", async function () {
        const [deployer] = await ethers.getSigners();

        const MeVerse = await ethers.getContractFactory('MeVerse');

        const name = 'TestOwner';
        const symbol = 'TO';
        const baseURI = "https://test.io";
        const tokenId = 1;
        const blueprint = '';
        const blob = toHex(`{${tokenId}}:{${blueprint}}`);

        const mintable = await MeVerse.deploy(deployer.address, name, symbol, deployer.address, baseURI);
        await mintable.mintFor(deployer.address, tokenId, blob);

        const tokenOwner = await mintable.ownerOf(tokenId);

        await expect(tokenOwner).to.equal(deployer.address);

    });

    it("Should revert mint with invalid blueprint", async function () {
        const [deployer, _fakeIMX] = await ethers.getSigners();

        const MeVerse = await ethers.getContractFactory('MeVerse');

        const name = 'TestOwner';
        const symbol = 'TO';
        const baseURI = "https://test.io";
        const blueprint = toHex(':');


        const mintable = await MeVerse.deploy(deployer.address, name, symbol, _fakeIMX.address, baseURI);
        await expect(mintable.mintFor(deployer.address, 1, blueprint)).to.be.reverted;
    });

    it("Should increase mintedNFTs when mint happens", async function () {
        const [deployer] = await ethers.getSigners();

        const MeVerse = await ethers.getContractFactory('MeVerse');

        const name = 'TestOwner';
        const symbol = 'TO';
        const baseURI = "https://test.io";
        const tokenId = 1;
        const blueprint = 1000;
        const blob = toHex(`{${tokenId}}:{${blueprint}}`);


        const mintable = await MeVerse.deploy(deployer.address, name, symbol, deployer.address, baseURI);
        await mintable.mintFor(deployer.address, 1, blob);

        expect(await mintable.totalSupply()).to.equal(1);

    });

    it("Should revert transaction when wallet exceedes amount of mint", async function () {
        const [deployer] = await ethers.getSigners();

        const MeVerse = await ethers.getContractFactory('MeVerse');

        const name = 'TestOwner';
        const symbol = 'TO';
        const baseURI = "https://test.io";
        const blueprint = 1000;


        const mintable = await MeVerse.deploy(deployer.address, name, symbol, deployer.address, baseURI);
        for (i = 0;i < 11;i++) {
            const blob = toHex(`{${i}}:{${blueprint}}`);
            await mintable.mintFor(deployer.address, 1, blob);
        }

        const blob = toHex(`{${12}}:{${blueprint}}`);

        expect(await mintable.totalSupply()).to.equal(11);
        await expect(mintable.mintFor(deployer.address, 1, blob)).to.be.reverted;

    });

    it("Should emit AssetEmmited event when token is minted", async function() {
        const [deployer] = await ethers.getSigners();

        const MeVerse = await ethers.getContractFactory('MeVerse');

        const name = 'TestOwner';
        const symbol = 'TO';
        const baseURI = "https://test.io";
        const tokenId = 1;
        const blueprint = 1000;
        const blob = toHex(`{${tokenId}}:{${blueprint}}`);


        const mintable = await MeVerse.deploy(deployer.address, name, symbol, deployer.address, baseURI);
        await expect(mintable.mintFor(deployer.address, 1, blob)).to.emit(mintable, "AssetMinted");

    });
});

function toHex(str) {
    let result = '';
    for (let i=0; i < str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }
    return '0x' + result;
  }
  
function fromHex(str1) {
    let hex = str1.toString().substr(2);
    let str = '';
    for (let n = 0; n < hex.length; n += 2) {
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
}