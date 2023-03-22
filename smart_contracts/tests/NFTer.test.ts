// @ts-nocheck
import dotenv from 'dotenv'
import Accounts from 'web3-eth-accounts'
import Web3EthContract from 'web3-eth-contract'
import Web3WsProvider from 'web3-providers-ws'

import NFTer from '../artifacts/contracts/NFTer.sol/NFTer.json'

dotenv.config();

const provider = new Web3WsProvider(`wss://${process.env.TEST_WEB3_PROVIDER}`);
const accounts = new Accounts(provider);
const account = accounts.privateKeyToAccount(process.env.PRIVATE_KEY);

Web3EthContract.setProvider(provider);
const contract = new Web3EthContract(NFTer.abi, process.env.NFTER_CONTRACT, {
    from: account.address
});

//First create a test NFTer and TestNFT contract with the commands in the readme.

// Manual test: When receiving ERC-721 NFT, the application creates an escrow and emits that it has received the NFT
/* To test: go to OpenSea, send the NFT to test contract. 
Go to mumbai.polygonscan.com to see if a child contract is made and if the NFT was moved to that escrow.*/

main();
async function main() {
    //Verify that the smart contract is working
    console.log(await contract.methods.getTime().call());
}