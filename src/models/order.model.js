'use strict'

const { Types, Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'order'
const COLLECTION_NAME = 'orders'

const order = new Schema({
    order_userId: {type: Types.ObjectId, required: true},
    order_status: {type: String, enum: ['pending', 'shipping', 'confirm', 'canceled', 'delivered'], default: 'pending'} ,
    order_tracking_code: {type: String, default: ''},
    order_address: {type: Object, required: true},
    order_checkout: {type: Object, required: true},
    order_products: {type: Array, required: true}
}, {
    timestamps: true, 
    collection: COLLECTION_NAME
}) 