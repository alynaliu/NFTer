import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid';

const Schema = new mongoose.Schema({
    publicAddress: {
        type: String,
        required: true
    },
    nonce : {
        type: String,
        required: true,
        default: uuidv4()
    }
})

export const Accounts = mongoose.model('Account', Schema);