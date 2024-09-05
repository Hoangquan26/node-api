'use strict'

const { Types, Schema, model } = require('mongoose')
const DOCUMENT_NAME = "cart"
const COLLECTION_NAME = "carts"

const cartSchema = new Schema({
    cart_status: {
        type: String,
        required: true,
        enum: ['active', 'completed', 'failed', 'pending'],
        default: 'active'
    },
    cart_product: { type: Array, default: [] },
    cart_product_count:  { type: Number, default: 0},
    cart_userId: {type: Number, required: true}
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME, cartSchema)