// @ts-nocheck
import dotenv from 'dotenv'
import { ethers } from 'hardhat'

import IERC4907 from '../artifacts/contracts/IERC4907.sol/IERC4907.json'
import NFTer from '../artifacts/contracts/NFTer.sol/NFTer.json'

dotenv.config();

const alchemy = new ethers.providers.AlchemyProvider(
    'maticmum',
    process.env.ALCHEMY_API_KEY
);
const account = new ethers.Wallet(process.env.PRIVATE_KEY as string, alchemy);
const contract = new ethers.Contract(process.env.NFTER_CONTRACT, NFTer.abi, account);
const NFTcontract = new ethers.Contract(process.env.TESTNFT_CONTRACT, IERC4907.abi, account);

//First create a test NFTer and TestNFT contract with the commands in the readme.

// Manual test: When receiving ERC-721 NFT, the application creates an escrow and emits that it has received the NFT
/* To test: go to OpenSea, send the NFT to test contract. 
Go to mumbai.polygonscan.com to see if a child contract is made and if the NFT was moved to that escrow.*/

function testIERC4907() {
    NFTcontract.on('UpdateUser',async (tokenId, user, expires) => {
        console.log(tokenId, user, expires);
    });
    console.log(await NFTcontract.userOf(1));
    console.log(await NFTcontract.userExpires(1));
    await NFTcontract.setUser(1, "0x57d988e4C48fC2ed50fd13BDde47F677d0812bA7", 1679690000);
    console.log(await NFTcontract.userOf(1));
    console.log(await NFTcontract.userExpires(1));
}

async function main() {
    //Verify that the smart contract is working
    console.log(await contract.methods.getTime());

    testIERC4907
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});