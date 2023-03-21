import * as dotenv from 'dotenv'
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";

dotenv.config();

const { GOERLI_API_URL, MUMBAI_API_URL, SEPOLIA_API_URL, PRIVATE_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  defaultNetwork: "mumbai",
  networks: {
    hardhat: {},
    mumbai: {
      url: MUMBAI_API_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    },
    goerli: {
      url: GOERLI_API_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    },
    sepolia: {
      url: SEPOLIA_API_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  }
};

export default config;