import mongoose from 'mongoose'

const Schema = new mongoose.Schema({
    blockchain: {
        type: String,
        requried: true,
        default: 'mumbai'
    },
    name: {
        type: String,
        required: false
    },
    tokenID: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        required: false
    },
    tokenType: {
        type: String,
        required: false
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
        required: false
    },
    maxRentalPeriod: {
        type: Number,
        required: false,
        default: 30
    },
    transactionHash: {
        type: String,
        required: true
    },
    escrow: {
        type: String,
        required: false
    }
})

export const ArchivedListings = mongoose.model('ArchivedListing', Schema);
export const Listings = mongoose.model('Listing', Schema);
export const PendingListings = mongoose.model('PendingListing', Schema);