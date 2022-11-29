import mongoose from 'mongoose'

const Schema = new mongoose.Schema({
    image: {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    ownerPublicAddress: {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        required: true
    },
    rentalRate: {
        type: Number,
        required: true
    },
    maxRentalPeriod: {
        type: Number,
        required: true,
        default: 30
    }
})

export const Listings = mongoose.model('Listing', Schema);