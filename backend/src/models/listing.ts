import mongoose from 'mongoose'

const Schema = new mongoose.Schema({
    blockchain: {
        type: String,
        requried: true
    },
    name: {
        type: String,
        required: true
    },
    tokenID: {
        type: Number,
        required: true
    },
    tokenUrl: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: false
    },
    contractType: {
        type: String,
        required: true
    },
    contractAddress: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    ownerPublicAddress: {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        required: true,
        default: true
    },
    rentalRate: {
        type: Number,
        required: true
    },
    maxRentalPeriod: {
        type: Number,
        required: true,
        default: 30
    },
    transactionHash: {
        type: String,
        required: true
    }
})

export const ArchivedListings = mongoose.model('ArchivedListing', Schema);
export const Listings = mongoose.model('Listing', Schema);
export const PendingListings = mongoose.model('PendingListing', Schema);