import express, { Request, Response } from 'express'

import { verifySignature } from '../config/authenticate'
import { getNFTMetadata, verifyNFTHolder } from '../config/blockchain'
import { BlockchainReturnNFT } from '../contracts/worker'
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
     * PURPOSE: Returns rental history of the user
     * USAGE: Display past and current NFT rentals onto the user interface
     */
    router.get('/userhistory', async (req: Request, res: Response) => {
        const { publicAddress } = req.query;
        const rental = await Rentals.find({renterPublicAddress: publicAddress}).lean()
        if(!rental /*|| rental?.renterPublicAddress !== publicAddress*/)
            return res.sendStatus(401);
        return res.send(rental);
    });

    /**
     * PURPOSE: Returns rental history of a single NFT
     * USAGE: Display past and current NFT rentals onto the user interface
     */
    router.get('/nfthistory', async (req: Request, res: Response) => {
        const { id } = req.query;
        const rental = await Rentals.find({listingID: id}).lean()
        if(!rental /*|| rental?.listingID !== id*/)
            return res.sendStatus(401);
        return res.send(rental);
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
            imageUrl: nftMetadata.media.raw,
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

        const listing = await Listings.findOne({ _id: listingID });
        if(!listing || listing?.ownerPublicAddress !== publicAddress)
            return res.sendStatus(401);
        
        const archivedListing = new ArchivedListings(listing.toJSON());
        await archivedListing.save();
        await listing.remove();

        await BlockchainReturnNFT(archivedListing.contractAddress, archivedListing.tokenID, archivedListing.ownerPublicAddress);

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
        
        await new PendingRentals({
            listingID: listingID,
            days: daysRentedFor,
            renterPublicAddress: publicAddress,
            transactionHash: transactionHash,
            price: listing.rentalRate * daysRentedFor
        }).save();

        return res.sendStatus(200);
    });
}