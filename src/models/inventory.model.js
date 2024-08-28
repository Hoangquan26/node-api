'use strict'

const {model, Types, Schema} = require('mongoose')

const DOCUMENT_NAME = 'Inventory'
const COLLECTION_NAME = 'Inventories'

const inventoryModel = new Schema({
    inven_shopId: {type: Types.ObjectId, required: true},
    inven_productId: {type: Types.ObjectId, required: true},
    inven_stock: {type: Number, required: true},
    inven_location: {type: String, default: 'Unknown'}
}, {
    collection: COLLECTION_NAME,
    timestamps: true
})

module.exports = model(DOCUMENT_NAME, inventoryModel)