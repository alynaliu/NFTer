import express, { Request, Response } from 'express'

export module NFT {
    export const router = express.Router();

    /**
     * PURPOSE: Returns basic information of every NFT rental listing
     * USAGE: Display NFT rentals onto the user interface
     * TODO: Add pagination for infinite scrolling by returning an ID to start querying from.
     */
    router.get('/listings', async (req: Request, res: Response) => {
        
    });

    /**
     * PURPOSE: Returns detailed information on a single NFT rental listing
     * USAGE: Display NFT rental onto the user interface
     */
    router.get('/listing', async (req: Request, res: Response) => {
        
    });

    /**
     * PURPOSE: Creates a single NFT rental listing
     * TODO: Go into the blockchain and clear all future rentals
     */
    router.post('/listing', async (req: Request, res: Response) => {
        
    });
    
    /**
     * PURPOSE: Edits a single NFT rental listing
     */
    router.put('/listing', async (req: Request, res: Response) => {

    });

    /**
     * PURPOSE: Deletes a single NFT rental listing
     * TODO: If using an internal wallet as a third party escrow, return the NFT. Wait until rental ends if rented.
     */
    router.delete('/listing', async (req: Request, res: Response) => {
        
    });

    /**
     * PURPOSE: Create a rental object for a corresponding NFT rental listing and accept payment
     */
    router.post('rent', async (req: Request, res: Response) => {
        
    });
}