import { bufferToHex, ecrecover, fromRpcSig, hashPersonalMessage, publicToAddress } from 'ethereumjs-util'
import { NextFunction, Request, Response } from 'express'
import Web3Utils from 'web3-utils'
import { v4 as uuidv4 } from 'uuid';

import { Accounts } from '../models/account'

export const verifySignature = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { publicAddress, signature } = req.query;
        if(typeof publicAddress !== 'string' || typeof signature !== 'string' || Web3Utils.isAddress(publicAddress) === false)
            throw new Error();

        const account = await Accounts.findOne({publicAddress: publicAddress}, 'nonce');
        if(account === null)
            throw new Error();
        
        const msg = `Signing a one-time nonce: ${account.nonce}`
        const msgBuffer = Buffer.from(msg, "utf-8");
        const msgHash = hashPersonalMessage(msgBuffer);
        const { v, r, s } = fromRpcSig(signature);
        const publicKey = ecrecover(msgHash, v, r, s);
        const addressBuffer = publicToAddress(publicKey);
        const address = bufferToHex(addressBuffer);

        //Change nonce for future actions
        if (address.toLowerCase() === publicAddress.toLowerCase()) {
            account.nonce = uuidv4();
            account.save();
            return next();
        } 
        throw new Error();      
    } catch (e) {
        return res
            .status(401)
            .send({ error: 'Signature verification failed' });
    }
}
