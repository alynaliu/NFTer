// @ts-nocheck
import dotenv from 'dotenv'
import Accounts from 'web3-eth-accounts'
import Web3EthContract from 'web3-eth-contract'
import Web3WsProvider from 'web3-providers-ws'
import Web3Utils from 'web3-utils'

import NFTer from '../artifacts/contracts/NFTer.sol/NFTer.json'

dotenv.config();

const provider = new Web3WsProvider(`wss://${process.env.TEST_WEB3_PROVIDER}`);
const accounts = new Accounts(provider);
const account = accounts.privateKeyToAccount(process.env.PRIVATE_KEY as string);

Web3EthContract.setProvider(provider);
const contract = new Web3EthContract(NFTer.abi, process.env.CONTRACT_ADDRESS, {
    from: account.address
});

//First create a test NFTer and TestNFT contract with the commands in the readme.

// Manual test: When receiving ERC-721 NFT, the application creates an escrow and emits that it has received the NFT
/* To test: go to OpenSea, send the NFT to test contract. 
Go to mumbai.polygonscan.com to see if a child contract is made and if the NFT was moved to that escrow.*/

async function testSendChildERC721() {
    //Condition: When the NFTer contract has an NFT and escrow created, send the NFT to the escrow.
    const contractAddress = "0x2E9c23197ed22177d9DAEEf8abEAA60c0E000B28";
    const tokenId = 98;

    console.log("Sending NFT to escrow!");
    const result = await contract.methods.sendChildERC721(contractAddress, tokenId);
    console.log("Done sending NFT to escrow!", result);

    //Verify: The NFT was transferred to the child contract and verified through opensea and polygonscan.
    const escrowAddress = "0xdB3a0694de97ECe55BecE234e0de235EBB8e6391";
}

main();
function main() {
    //Manually enter the test function you want to run here.
    testSendChildERC721();
}