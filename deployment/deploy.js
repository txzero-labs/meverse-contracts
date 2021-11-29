const { ethers, hardhatArguments } = require('hardhat');
const fs = require("fs");

const ARTIFACT_NAME = "MeVerse";

const deploymentDetails = () => {
    try {
        return JSON.parse(fs.readFileSync("./deployment_details.json").toString());
    } catch (err) {
        console.error();
        return {}
    }
}

async function main() {
    const deployDetails = deploymentDetails();
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contract with account: ", deployer.address);
    console.log("Account balance: ", deployer.getBalance().toString());

    if(!hardhatArguments.network) {
        throw new Error("--network argument missing.");
    }

    deployDetails.network = hardhatArguments.network;
    deployDetails.owner_address = deployer.address;

    const name = process.env.CONTRACT_NAME;
    const symbol = process.env.CONTRACT_SYMBOL;
    const baseURI = process.env.CONTRACT_BASE_URI;

    deployDetails.contract_address = await deployContract(name, symbol, baseURI);
    deployDetails.owner_public_key = await getPublicKey(deployer);
    deployDetails.name = name;

    console.log("[INFO] Smart contract successfully deployed.");
    fs.writeFileSync("./deployment_details_filled.json", JSON.stringify(regForm, null, 4));
    console.log("[INFO] Available deployment details have been stored in deployment_details_filled.json");
}

/**
 * Compiles contract and deploys it to selected network 
 * @param {string} name - Contract name
 * @param {string} symbol - Contract symbol
 * @param {string} uri - Base URI where metadata resides
 * @returns {string} Smart contract address
 */
async function deployContract(name, symbol, uri) {
    const SmartContract = await ethers.getContractFactory(ARTIFACT_NAME);

    const smartContract = await SmartContract.deploy(name, symbol, uri);

    await smartContract.deployed();

    console.log("Smart contract address: ", smartContract.address);

    return smartContract.address;
}

async function getPublicKey(deployer) {
    const message = 'Example message';
    const signed = await deployer.signMessage(message);
    const digest = ethers.utils.arrayify(ethers.utils.hashMessage(message))
    return await ethers.utils.recoverPublicKey(digest, signed)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error); 
        process.exit(1);
    });