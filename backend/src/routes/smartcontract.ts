import express, { Request, Response } from 'express'

import { BlockchainGetEscrowAddress } from '../contracts/worker'

export module SmartContract {
    export const router = express.Router();

    router.get('/address', async (req: Request, res: Response) => {
        res.send(process.env.CONTRACT_ADDRESS);
    });

    router.get('/escrow/address', async (req: Request, res: Response) => {
        const { contractAddress, tokenId } = req.query;
        const escrowAddress = await BlockchainGetEscrowAddress(contractAddress as string, parseInt(tokenId as string));
        res.send(escrowAddress);
    });
}
