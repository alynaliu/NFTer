import express, { Request, Response } from 'express'
import Web3Utils from 'web3-utils'

import { verifySignature } from '../config/authenticate'
import { getUserNFTs } from '../config/blockchain'
import { Accounts } from '../models/account'

export module Account {
    export const router = express.Router();

    /**
     * PURPOSE: Returns public information relating to a wallet's public address
     * USAGE: Returns nonce to be signed and verified
     */
    router.get('/publicAddress', async (req: Request, res: Response) => {
        const { publicAddress } = req.query;
        if(typeof publicAddress !== 'string' || Web3Utils.isAddress(publicAddress) === false)
            return res.sendStatus(404);
        
        const existingAccount = await Accounts.findOne({publicAddress: publicAddress}, 'nonce').lean();
        if(existingAccount) {
            return res.send({
                nonce: existingAccount.nonce
            });
        }

        const newAccount = new Accounts({publicAddress: publicAddress});
        await newAccount.save();
        return res.send({
            nonce: newAccount.nonce
        });
    });

    /**
     * PURPOSE: Returns a user's list of NFTs if the request comes from the requested user
     * USAGE: Allow the user to choose which NFT to add as a rental based on blockchain and smart contract
     */
    router.get('/nfts', verifySignature, async (req: Request, res: Response) => {
        const { publicAddress, chain, contract } = req.query;
        if(typeof publicAddress !== 'string' || typeof chain !== 'string' || typeof contract !== 'string') {
            return res.sendStatus(400);
        }
        
        const nfts = await getUserNFTs(publicAddress, chain, contract);
        return res.send(nfts);
    });
}