import express, { Request, Response } from 'express'

import { verifySignature } from '../config/authenticate'
import { getNFTMetadata, verifyNFTHolder } from '../config/blockchain'
import { BlockchainGetTime, BlockchainRentNFT, BlockchainReturnNFT } from '../contracts/worker'
import { ArchivedListings, Listings, PendingListings } from '../models/listing'
import { ArchivedRentals, PendingRentals, Rentals } from '../models/rental'

export module NFT {
    export const router = express.Router();

    /**
     * PURPOSE: Returns basic information of every NFT rental listing
     * USAGE: Display available NFT rentals onto the user interface
     * TODO: Add pagination for infinite scrolling by returning an ID to start querying from.
     */
    router.get('/listings', async (req: Request, res: Response) => {
        const { available, publicAddress } = req.query;
        const listings = publicAddress == undefined ? 
            await Listings.find({available: available}, 'imageUrl name').lean() : 
            await Listings.find({ownerPublicAddress: publicAddress}).lean();
        return res.send(listings);
    });

    /**
     * PURPOSE: Returns detailed information on a single NFT rental listing
     * USAGE: Display NFT rental onto the user interface
     */
    router.get('/listing', async (req: Request, res: Response) => {
        const { id } = req.query;
        const listing = await Listings.findOne({_id: id}).lean();
        return res.send(listing);
    });

    /**
     * PURPOSE: Creates a single NFT rental listing
     * TODO: Make sure the NFT being added is ERC-4907 compliant.
     * TODO: Go into the blockchain and clear all future rentals
     * TODO: Transfer the NFT from the owner's wallet to the escrow wallet.
     */
    router.post('/listing', verifySignature, async (req: Request, res: Response) => {
        const { publicAddress } = req.query;
        const { tokenID, contractAddress, rentalRate, maxRentalPeriod, transactionHash } = req.body;
    
        const verifiedHolder = await verifyNFTHolder(publicAddress as string, contractAddress, tokenID);

        if(verifiedHolder === false)
            return res.sendStatus(401);

        const nftMetadata = await getNFTMetadata(contractAddress, tokenID);
        await new PendingListings({
            name: nftMetadata.metadata.name,
            tokenID: tokenID,
            imageUrl: nftMetadata.media[0].gateway,
            tokenType: nftMetadata.id.tokenMetadata.tokenType,
            contractAddress: contractAddress,
            description: nftMetadata.metadata.description,
            ownerPublicAddress: publicAddress,
            rentalRate: rentalRate,
            maxRentalPeriod: maxRentalPeriod,
            transactionHash: transactionHash
        }).save();

        return res.sendStatus(200);
    });
    
    /**
     * PURPOSE: Edits a single NFT rental listing
     */
    router.put('/listing', verifySignature, async (req: Request, res: Response) => {
        const { publicAddress } = req.query;
        const { listingID, rentalRate, maxRentalPeriod } = req.body;
        
        const listing = await Listings.findOne({ _id: listingID });
        if(!listing || listing?.ownerPublicAddress !== publicAddress)
            return res.sendStatus(401);

        if(rentalRate)      listing.rentalRate = rentalRate;
        if(maxRentalPeriod) listing.maxRentalPeriod = maxRentalPeriod;
        await listing.save();

        return res.sendStatus(200);
    });

    /**
     * PURPOSE: Deletes a single NFT rental listing
     * TODO: If using an internal wallet as a third party escrow, return the NFT. Wait until rental ends if rented.
     */
    router.delete('/listing', verifySignature, async (req: Request, res: Response) => {
        const { publicAddress, listingID } = req.query;

        //Listing must belong to the requester
        const listing = await Listings.findOne({ _id: listingID });
        if(!listing || listing?.ownerPublicAddress !== publicAddress) return res.sendStatus(401);
        //Listing must not have any active rentals
        const rentals = await Rentals.find({ listingID: listingID })
        if(rentals) return res.sendStatus(406);

        BlockchainReturnNFT(listing.contractAddress, listing.tokenID);
        return res.sendStatus(200);
    });

    router.get('/rent', verifySignature, async (req: Request, res: Response) => {
        const { publicAddress } = req.query;

        const pendingRentals = await PendingRentals.find({renterPublicAddress: publicAddress}).lean();
        const activeRentals = await Rentals.find({renterPublicAddress: publicAddress}).lean();
        const archivedRentals = await ArchivedRentals.find({renterPublicAddress: publicAddress}).lean();

        return res.send({ pendingRentals, activeRentals, archivedRentals });
    });

    /**
     * PURPOSE: Create a rental object for a corresponding NFT rental listing and accept payment
     */
    router.post('/rent', verifySignature, async (req: Request, res: Response) => {
        const { publicAddress } = req.query;
        const { listingID, daysRentedFor, transactionHash } = req.body;

        const listing = await Listings.findOne({_id: listingID}, 'ownerPublicAddress available rentalRate maxRentalPeriod');
        if(!listing || listing.available == false || daysRentedFor > listing.maxRentalPeriod)
            return res.sendStatus(400);
        listing.available = false;
        await listing.save();
        
        //See if the Blockchain worker already created a pending rental
        const pendingRental = await PendingRentals.findOne({transactionHash: transactionHash});
        if(pendingRental) {
            const price = listing.rentalRate * daysRentedFor;
            if(price !== pendingRental.price) return;

            //Delete pending rental and create active rental
            const rental = new Rentals(pendingRental.toJSON());
            rental.listingID = listingID;
            rental.days = daysRentedFor;
            rental.rentedFrom = new Date();
            const currentDate = new Date();
            //Rental expires in minutes instead of days
            var newDateObj = new Date(currentDate.getTime() + rental.days*60000);
            rental.rentedUntil = newDateObj;
            await rental.save();
            await pendingRental.remove();

            const currentTime = await BlockchainGetTime();
            //DEMO: Rental expires in minutes instead of days
            const expiry = currentTime.add(60 * rental.days);
            await BlockchainRentNFT(listing.contractAddress, listing.tokenID, rental.renterPublicAddress, expiry);
        }
        else {
            await new PendingRentals({
                listingID: listingID,
                days: daysRentedFor,
                renterPublicAddress: (publicAddress as string).toLowerCase(),
                transactionHash: transactionHash,
                price: listing.rentalRate * daysRentedFor
            }).save();
        }

        return res.sendStatus(200);
    });
}
