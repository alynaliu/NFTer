import express, { Request, Response } from 'express'
import Web3Utils from 'web3-utils'

import { Accounts } from '../models/account'

export module Account {
    export const router = express.Router();

    /**
     * PURPOSE: Returns public information relating to a wallet's public address
     * USAGE: Returns nonce to be signed and verified
     */
    router.get('/publicAddress', async (req: Request, res: Response) => {
        if(typeof req.query.key !== 'string' || Web3Utils.isAddress(req.query.key) === false)
            return res.sendStatus(404);
        
        const existingAccount = await Accounts.findOne({publicAddress: req.query.key}, 'nonce').lean();
        if(existingAccount) {
            return res.send({
                nonce: existingAccount.nonce
            });
        }

        const newAccount = new Accounts({ publicAddress: req.query.key });
        await newAccount.save();
        return res.send({
            nonce: newAccount.nonce
        });
    });

    /**
     * PURPOSE: Returns a user's list of NFTs if the request comes from the requested user
     * USAGE: Allow the user to choose which NFT to add as a rental
     */
    router.get('/nfts', (req: Request, res: Response) => {
        
    });
}