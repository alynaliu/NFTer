import express, { Request, Response } from 'express'

import { verifySignature } from '../config/authenticate'
import { Listings } from '../models/listing'

export module NFT {
    export const router = express.Router();

    /**
     * PURPOSE: Returns basic information of every NFT rental listing
     * USAGE: Display available NFT rentals onto the user interface
     * TODO: Add pagination for infinite scrolling by returning an ID to start querying from.
     */
    router.get('/listings', async (req: Request, res: Response) => {
        const { available } = req.query;
        const listings = await Listings.find({available: available}, 'image name').lean();
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
     * TODO: Go into the blockchain and clear all future rentals
     */
    router.post('/listing', verifySignature, async (req: Request, res: Response) => {
        
    });
    
    /**
     * PURPOSE: Edits a single NFT rental listing
     */
    router.put('/listing', verifySignature, async (req: Request, res: Response) => {

    });

    /**
     * PURPOSE: Deletes a single NFT rental listing
     * TODO: If using an internal wallet as a third party escrow, return the NFT. Wait until rental ends if rented.
     */
    router.delete('/listing', verifySignature, async (req: Request, res: Response) => {

    });

    /**
     * PURPOSE: Create a rental object for a corresponding NFT rental listing and accept payment
     */
    router.post('rent', verifySignature, async (req: Request, res: Response) => {
        
    });
}