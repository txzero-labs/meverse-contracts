import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import * as dotenv from "dotenv";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";

dotenv.config();



module.exports = {
    gasReporter: {
        currency: 'USD',
        coinmarketCap: process.env.COINMARKET_KEY_API
    },
    solidity: {
        version: "0.8.4",
        settings: {
            optimizer: {
                enabled: true,
                runs: 500,
            }
        }
    },
    networks: {
        ropsten: {
            url: `https://eth-ropsten.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
            accounts: [`0x${process.env.DEPLOYER_ROPSTEN_PRIVATE_KEY}`],
        },
        mainnet: {
            url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
            accounts: [`0x${process.env.DEPLOYER_MAINNET_PRIVATE_KEY}`],
        },
    },
    typechain: {
        outDir: "artifacts/typechain",
        target: "ethers-v5",
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY
    },
};