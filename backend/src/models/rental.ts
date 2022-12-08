import mongoose from 'mongoose'

const Schema = new mongoose.Schema({
    listingID: {
        type: String,
        required: true
    },
    rentedFrom: {
        type: Date,
        required: false
    },
    rentedUntil: {
        type: Date,
        required: false
    },
    days: {
        type: Number,
        required: true
    },
    renterPublicAddress: {
        type: String,
        required: true
    },
    transactionHash: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
})

export const ArchivedRentals = mongoose.model('ArchivedRental', Schema);
export const PendingRentals = mongoose.model('PendingRental', Schema);
export const Rentals = mongoose.model('Rental', Schema);