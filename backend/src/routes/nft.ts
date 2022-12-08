import express, { Request, Response } from 'express'

import { verifySignature } from '../config/authenticate'
import { getNFTMetadata, verifyNFTHolder } from '../config/blockchain'
import { ArchivedListings, Listings, PendingListings } from '../models/listing'
import { PendingRentals, Rentals } from '../models/rental'

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
            await Listings.find({ownerPublicAddress: publicAddress}, 'imageUrl name').lean();
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
        const { blockchain, tokenID, contractAddress, rentalRate, maxRentalPeriod } = req.body;
    
        const verifiedHolder = await verifyNFTHolder(publicAddress as string, blockchain, contractAddress, tokenID);
        
        if(verifiedHolder === false)
            return res.sendStatus(401);

        const nftMetadata = await getNFTMetadata(blockchain, contractAddress, tokenID);
        await new PendingListings({
            blockchain: blockchain,
            name: nftMetadata.attributes?.name,
            tokenID: tokenID,
            tokenUrl: nftMetadata.attributes?.tokenUrl,
            imageUrl: nftMetadata.attributes?.imageUrl,
            contractType: nftMetadata.metadata?.contractType,
            contractAddress: contractAddress,
            description: nftMetadata.attributes?.description,
            ownerPublicAddress: publicAddress,
            rentalRate: rentalRate,
            maxRentalPeriod: maxRentalPeriod
        }).save();

        return res.sendStatus(200);
    });
    
    /**
     * PURPOSE: Edits a single NFT rental listing
     */
    router.put('/listing', verifySignature, async (req: Request, res: Response) => {
        const { publicAddress } = req.query;
        const { listingID, description, rentalRate, maxRentalPeriod } = req.body;
        
        const listing = await Listings.findOne({ _id: listingID });
        if(!listing || listing?.ownerPublicAddress !== publicAddress)
            return res.sendStatus(401);

        if(description)     listing.description = description;
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

        const listing = await Listings.findOne({ _id: listingID });
        if(!listing || listing?.ownerPublicAddress !== publicAddress)
            return res.sendStatus(401);
        
        const archivedListing = new ArchivedListings(listing.toJSON());
        await archivedListing.save();
        await listing.remove();

        return res.sendStatus(200);
    });

    router.get('/rent', verifySignature, async (req: Request, res: Response) => {
        const { publicAddress } = req.query;

        const rentals = await Rentals.find({renterPublicAddress: publicAddress}).lean();
        return res.send(rentals);
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

        const rentedUntil = new Date();
        rentedUntil.setDate(rentedUntil.getDate() + daysRentedFor);
        
        await new PendingRentals({
            listingID: listingID,
            rentedFrom: listing.ownerPublicAddress,
            rentedUntil: rentedUntil,
            renterPublicAddress: publicAddress,
            transactionHash: transactionHash,
            price: listing.rentalRate * daysRentedFor
        }).save();

        return res.sendStatus(200);
    });
}