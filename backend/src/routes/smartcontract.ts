import express, { Request, Response } from 'express'

export module SmartContract {
    export const router = express.Router();

    router.get('/address', async (req: Request, res: Response) => {
        res.send(process.env.CONTRACT_ADDRESS);
    });
}
