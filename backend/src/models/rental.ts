import mongoose from 'mongoose'

const Schema = new mongoose.Schema({
    listingID: {
        type: String,
        required: true
    },
    rentedFrom: {
        type: Date,
        required: true
    },
    rentedUntil: {
        type: Date,
        required: true
    },
    renterPublicAddress: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
})

export const Rentals = mongoose.model('Rental', Schema);