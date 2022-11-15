import express from 'express'
import dotenv from 'dotenv'

import { Database } from './config/db'

dotenv.config();
Database.connect();

const app = express();
const port = 5000;

app.use(express.json());

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})