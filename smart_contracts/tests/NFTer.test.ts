// @ts-nocheck
import dotenv from 'dotenv'
import Accounts from 'web3-eth-accounts'
import Web3EthContract from 'web3-eth-contract'
import Web3WsProvider from 'web3-providers-ws'

import NFTer from '../artifacts/contracts/NFTer.sol/NFTer.json'

dotenv.config();

const provider = new Web3WsProvider(process.env.TEST_WEB3_PROVIDER);
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

async function testSendChildERC721() {
    //Condition: When the NFTer contract has an NFT and escrow created, send the NFT to the escrow.
    const contractAddress = "0x2e9c23197ed22177d9daeef8abeaa60c0e000b28";
    const tokenId = 94;

    console.log("Sending NFT to escrow!");
    const result = await contract.methods.sendChildERC721(contractAddress, tokenId).call();
    console.log("Done sending NFT to escrow!", result);

    //Verify: The NFT was transferred to the child contract and verified through opensea and polygonscan.
    const escrowAddress = "0xdB3a0694de97ECe55BecE234e0de235EBB8e6391";
}

main();
async function main() {
    //Verify that the smart contract is working
    console.log(await contract.methods.getTime().call());
    console.log(await contract.methods.getEscrowAddress("0x2e9c23197ed22177d9daeef8abeaa60c0e000b28", 94).call());
    testSendChildERC721();

    contract.events.ReceivedERC721NFT(async (error, event) => {
        if(event) {
            console.log(event);
        }
        if(error) {
            console.log(error);
        }
});
}