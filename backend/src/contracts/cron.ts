import cron from 'node-cron'

import { Listings } from '../models/listing'
import { Rentals } from '../models/rental'
import { BlockchainPayOwner } from './worker'

export function RunCronJob() {
    //Runs everyday at midnight 
    cron.schedule('0 0 0 * * *', async () => {
        //Get expired rentals
        const time = new Date();
        const rentals = await Rentals.find({
            rentedUntil: {$lt: time}
        });

        for(const rental of rentals) {
            const listing = await Listings.findOne({_id: rental.listingID});
            await BlockchainPayOwner(listing.contractAddress, listing.tokenID, rental.renterPublicAddress);
        }
    });
}