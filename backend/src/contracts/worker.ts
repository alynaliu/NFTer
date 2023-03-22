// @ts-nocheck
import dotenv from 'dotenv'
import Accounts from 'web3-eth-accounts'
import Web3EthContract from 'web3-eth-contract'
import Web3WsProvider from 'web3-providers-ws'
import Web3Utils from 'web3-utils'

import NFTer from './NFTer.json'
import { Listings, PendingListings } from '../models/listing'
import { PendingRentals, Rentals } from '../models/rental'

dotenv.config();

const provider = new Web3WsProvider(`wss://${process.env.WEB3_PROVIDER}`);
const accounts = new Accounts(provider);
const account = accounts.privateKeyToAccount(process.env.OWNER_PRIVATE_KEY);

Web3EthContract.setProvider(provider);
const contract = new Web3EthContract(NFTer.abi, process.env.CONTRACT_ADDRESS, {
        from: account.address
});

export function BlockchainWorker()
{
        contract.events.ReceivedERC721NFT(async (error, event) => {
                if(event) {
                        const pendingListing = await PendingListings.findOne({transactionHash: event.transactionHash});
                        if(!pendingListing)
                                return;
                        
                        const listing = new Listings(pendingListing.toJSON());
                        await listing.save();
                        await pendingListing.remove();
                }
                if(error) {
                        console.log(error);
                }
        });

        contract.events.ReceivedETH(async (error, event) => {
                if(event) {
                        const pendingRental = await PendingRentals.findOne({transactionHash: event.transactionHash});
                        const weiValue = Web3Utils.toWei(pendingRental.price, 'ether');
                        if(!pendingListing || event.returnValues.amount !== weiValue)
                                return;
                        
                        const rental = new Rentals(pendingRental.toJSON());
                        rental.rentedFrom = Date.now();
                        const rentedUntil = new Date();
                        rental.rentedUntil = rentedUntil.setDate(rentedUntil.getDate() + rental.days);
                        await rental.save();
                        await pendingRental.remove();

                        const listing = await Listings.findOne({_id: rental.listingID});
                        const currentTime = await contract.methods.getTime();
                        const expiry = currentTime.add(86400 * rental.days);
                        await contract.methods.rentNFT(listing.contractAddress, listing.tokenID, rental.renterPublicAddress, expiry);
                        await contract.methods.payOwner(listing.ownerPublicAddress, event.returnValues.amount);
                }
                if(error) {
                        console.log(error);
                }
        });
}

export async function BlockchainRentNFT(contractAddress: string, tokenId: int, renterAddress: string,  expires: int)
{
        await contract.methods.rentNFT(contractAddress, tokenId, renterAddress, expires);
}

export async function BlockchainReturnNFT(contractAddress: string, tokenId: int)
{
        const output = await contract.methods.returnNFT(contractAddress, tokenId);
        return output;
}

export async function PayOwner(contractAddress: string, tokenId: int, _to: string)
{
        const output = await contract.methods.payOwner(contractAddress, tokenId, _to);    
        return output;    
}
