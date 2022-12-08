import express from 'express'
import dotenv from 'dotenv'

import { Database } from './config/db'
import { Account } from './routes/account'
import { NFT } from './routes/nft'
import { BlockchainWorker } from './contracts/worker'

dotenv.config();
Database.connect();

const app = express();
const port = 5000;

app.use(express.json());

app.use('/api/account', Account.router);
app.use('/api/nft', NFT.router);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})

BlockchainWorker();