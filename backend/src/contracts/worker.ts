import dotenv from 'dotenv'
import { ethers, AlchemyProvider, Log } from 'ethers'
import Web3Utils from 'web3-utils'

import NFTer from './NFTer.json'
import { Listings, PendingListings } from '../models/listing'
import { PendingRentals, Rentals } from '../models/rental'

dotenv.config();

const alchemy = new AlchemyProvider('maticmum', process.env.ALCHEMY_API_KEY);
const account = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY as string, alchemy);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, NFTer.abi, account);

export function BlockchainWorker()
{
        contract.on('EscrowReceivedERC721NFT', async (contractAddress: string, from: string, tokenId: number, escrow: string, log: Log) => {
                const pendingListing = await PendingListings.findOne({transactionHash: log.transactionHash});
                if(!pendingListing) return;
                        
                const listing = new Listings(pendingListing.toJSON());
                await listing.save();
                await pendingListing.remove();
        });

        contract.on('ReceivedETH', async (from: string, amount: any, escrow: string, log: Log) => {
                //See if the backend already created a pending rental
                const pendingRental = await PendingRentals.findOne({transactionHash: log.transactionHash});
                if(pendingRental) {
                        const price = Number(amount) / Math.pow(10, 18);
                        if(price !== pendingRental.price) return;

                        //Delete pending rental and create active rental
                        const rental = new Rentals(pendingRental.toJSON());
                        rental.rentedFrom = new Date();
                        const rentedUntil = new Date();
                        rentedUntil.setDate(rentedUntil.getDate() + rental.days);
                        rental.rentedUntil = rentedUntil;
                        await rental.save();
                        await pendingRental.remove();

                        const listing = await Listings.findOne({_id: rental.listingID});
                        const currentTime = await contract.getTime();
                        const expiry = currentTime.add(86400 * rental.days);
                        await contract.rentNFT(listing.contractAddress, listing.tokenID, rental.renterPublicAddress, expiry);
                }
                else {
                        const price = Number(amount) / Math.pow(10, 18);
                        await new PendingRentals({
                                renterPublicAddress: from.toLowerCase(),
                                transactionHash: log.transactionHash,
                                price: price
                        }).save();
                }
        });
}

export async function BlockchainGetTime()
{
        return await contract.getTime();
}

export async function BlockchainRentNFT(contractAddress: string, tokenId: number, renterAddress: string,  expires: number)
{
        return await contract.rentNFT(contractAddress, tokenId, renterAddress, expires);
}

export async function BlockchainReturnNFT(contractAddress: string, tokenId: number)
{
        return await contract.returnNFT(contractAddress, tokenId);
}

export async function PayOwner(contractAddress: string, tokenId: number, _to: string)
{
        return await contract.payOwner(contractAddress, tokenId, _to);  
}
