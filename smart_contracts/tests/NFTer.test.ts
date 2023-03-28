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
const escrowAddress = "0x6A1C17CF81424CC920a268Ec8903f0f1De8c6E35";
const renterAddress = "0xB9C66b08b1993C170f52381fadD85415b1819887";
const ownerAddress = "0x57d988e4C48fC2ed50fd13BDde47F677d0812bA7";
const tokenId = 7;

//First create a test NFTer and TestNFT contract with the commands in the readme.

// Manual test: When receiving ERC-721 NFT, the application creates an escrow and emits that it has received the NFT
/* To test: go to OpenSea, send the NFT to test contract. 
Go to mumbai.polygonscan.com to see if a child contract is made and if the NFT was moved to that escrow.*/

async function testRentNFT(){
    const expires = parseInt(await contract.getTime()) + 100;
    await contract.rentNFT(process.env.TESTNFT_CONTRACT, tokenId, renterAddress, expires)
}

async function testReturnNFT(){
    console.log(await contract.payOwner(process.env.TESTNFT_CONTRACT, tokenId, ownerAddress));
    console.log(await contract.returnNFT(process.env.TESTNFT_CONTRACT, tokenId, {gasLimit:30000}));    
}

async function testGetters(){
    const escrow = await contract.getEscrowAddress(process.env.TESTNFT_CONTRACT, tokenId);
    console.log (escrow);
    const nft_Detail = await contract.getNFTDetails(escrowAddress);
    console.log (nft_Detail);

    const renterAddress = "0xB9C66b08b1993C170f52381fadD85415b1819887";
}

async function testIERC4907() {
    NFTcontract.on('UpdateUser', async (tokenId, user, expires) => {
        console.log(tokenId, user, expires);
    });
    await NFTcontract.setUser(1, "0xB9C66b08b1993C170f52381fadD85415b1819887", 1679690000);
    console.log(await NFTcontract.userOf(1));
    console.log(await NFTcontract.userExpires(1));
}

async function main() {
    // subscribe to new user update
    NFTcontract.on('UpdateUser', async (tokenId, user, expires) => {
        console.log(tokenId, user, expires);
    });

    //Verify that the smart contract is working
    console.log(await contract.getTime());
    //testGetters();
    //testRentNFT();
    testReturnNFT();

    console.log ('Sleeping for 60 seconds');
    await new Promise(r => setTimeout(r, 60000));
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});