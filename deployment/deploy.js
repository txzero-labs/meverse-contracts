const { ethers, hardhatArguments } = require('hardhat');

const ARTIFACT_NAME = "MeVerse";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contract with account: ", deployer.address);
    console.log("Account balance: ", deployer.getBalance().toString());

    if(!hardhatArguments.network) {
        throw new Error("--network argument missing.");
    }

    const owner = process.env.CONTRACT_OWNER_ADDRESS;
    const name = process.env.CONTRACT_NAME;
    const symbol = process.env.CONTRACT_SYMBOL;
    const baseURI = process.env.CONTRACT_BASE_URI;

    await deployContract(owner, name, symbol, hardhatArguments.network, baseURI);
}

/**
 * Compiles contract and deploys it to selected network 
 * @param {string} owner - Contract owner address
 * @param {string} name - Contract name
 * @param {string} symbol - Contract symbol
 * @param {string} network - Network where to deploy contract
 * @param {string} uri - Base URI where metadata resides
 */
async function deployContract(owner, name, symbol, network, uri) {
    const SmartContract = await ethers.getContractFactory(ARTIFACT_NAME);
    const imxAddress = getIMXAddress(network);

    const smartContract = await SmartContract.deploy(owner, name, symbol, imxAddress, uri);
    console.log("Smart contract address: ", smartContract.address);
}


/**
 * Returns IMX address for deployment.
 * @param {string} network - address, ropsten test net or mainnet
 * @returns {string} IMX address
 */
function getIMXAddress(network) {
    switch(network) {
        case 'ropsten': 
            return '0x4527be8f31e2ebfbef4fcaddb5a17447b27d2aef';
        case 'mainnet':
            return '0x5FDCCA53617f4d2b9134B29090C87D01058e27e9';
    }
    throw new Error('Invalid network selected');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error); 
        process.exit(1);
    });