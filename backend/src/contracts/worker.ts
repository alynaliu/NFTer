import dotenv from 'dotenv'
import { ethers, AlchemyProvider, Log } from 'ethers'
import Web3Utils from 'web3-utils'

import NFTer from './NFTer.json'
import { ArchivedListings, Listings, PendingListings } from '../models/listing'
import { ArchivedRentals, PendingRentals, Rentals } from '../models/rental'

dotenv.config();

const alchemy = new AlchemyProvider('maticmum', process.env.ALCHEMY_API_KEY);
const account = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY as string, alchemy);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, NFTer.abi, account);

export function BlockchainWorker()
{
        contract.on('EscrowReceivedERC721NFT', async (contractAddress: string, from: string, tokenId: number, escrow: string, log: Log) => {
                const pendingListing = await PendingListings.findOne({transactionHash: log.transactionHash});
                if(pendingListing) {
                        const listing = new Listings(pendingListing.toJSON());
                        await listing.save();
                        await pendingListing.remove();
                }
                else {
                        await new PendingListings({
                                tokenID: Number(tokenId),
                                contractAddress: contractAddress,
                                ownerPublicAddress: from.toLowerCase(),
                                transactionHash: log.transactionHash
                        }).save();
                }
        });

        contract.on('ReceivedETH', async (from: string, amount: bigint, escrow: string, log: Log) => {
                //See if the backend already created a pending rental
                const pendingRental = await PendingRentals.findOne({transactionHash: log.transactionHash});
                if(pendingRental) {
                        const price = Number(amount) / Math.pow(10, 18);
                        if(price !== pendingRental.price) return;

                        //Delete pending rental and create active rental
                        const rental = new Rentals(pendingRental.toJSON());
                        rental.rentedFrom = new Date();
                        const currentDate = new Date();
                        //DEMO: Rental expires in minutes instead of days
                        var newDateObj = new Date(currentDate.getTime() + rental.days*60000);
                        rental.rentedUntil = newDateObj;
                        await rental.save();
                        await pendingRental.remove();

                        const listing = await Listings.findOne({_id: rental.listingID});
                        const currentTime = await contract.getTime();
                        //DEMO: Rental expires in minutes instead of days
                        const expiry = currentTime.add(60 * rental.days);
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

        contract.on('PayedETH', async (renter: string, owner: string, amount: bigint, escrow: string, log: Log) => {
                const [contractAddress, tokenId] = await BlockchainGetNFTDetails(escrow);
                const listing = await Listings.findOne({
                        ownerPublicAddress: owner,
                        contractAddress: contractAddress,
                        tokenID: tokenId
                });
                const rental = await Rentals.findOne({
                        listingID: listing._id,
                        renterPublicAddress: renter
                })

                const archivedRental = new ArchivedRentals(rental.toJSON());
                await archivedRental.save();
                await rental.remove();

                listing.available = true;
                await listing.save();
        });

        contract.on('ReturnedERC721NFT', async (contractAddress: string, to: string, tokenId: number, log: Log) => {
                const listing = await Listings.findOne({
                        ownerPublicAddress: to,
                        contractAddress: contractAddress,
                        tokenID: tokenId
                });

                const archivedListing = new ArchivedListings(listing.toJSON());
                await archivedListing.save();
                await listing.remove();
        });
}

export async function BlockchainGetTime()
{
        return await contract.getTime();
}

export async function BlockchainGetEscrowAddress(contractAddress: string, tokenId: number)
{
        return await contract.getEscrowAddress(contractAddress, tokenId);
}

export async function BlockchainGetNFTDetails(escrow: string)
{
        const [contractAddress, tokenId] =  await contract.getNFTDetails(escrow);
        return [contractAddress, tokenId];
}

export async function BlockchainRentNFT(contractAddress: string, tokenId: number, renterAddress: string,  expires: number)
{
        await contract.rentNFT(contractAddress, tokenId, renterAddress, expires);
}

export async function BlockchainReturnNFT(contractAddress: string, tokenId: number)
{
        //Only do this if no active rentals.
        await contract.returnNFT(contractAddress, tokenId);
}

export async function BlockchainPayOwner(contractAddress: string, tokenId: number, _to: string)
{
        await contract.payOwner(contractAddress, tokenId, _to);
}
