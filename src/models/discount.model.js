'use strict'

const { Types, model, Schema} = require('mongoose')

const DOCUMENT_NAME = "discount"
const COLLECTION_NAME = "discounts"

const discountSchema = new Schema({
    discount_name : {type: String, required: true},
    discount_description: {type: String, required: true},
    discount_type: {type: String, default: 'fixed_amount', enum: ['fixed_amount', 'percentage']},
    discount_value: {type: Number, required: true}, // 10.000vnd or 10%
    discount_code: {type: String, required: true}, // discount code

    discount_start_date : {type: Date, required: true}, // time start discount
    discount_end_date: {type: String, required: true},

    discount_user_used: {type: Array, default: []},
    discount_max_uses: {type: Number, required: true},
    discount_uses_count: {type: Number, required: true}, // save user_id who used discount
    discount_max_uses_per_user: {type: Number, required: true}, //max uses each user,
    discount_min_order_value: {type: Number, required: true},
    discount_shopId: {type: Types.ObjectId, required: true, ref: 'Shop'},
    
    discount_is_active: {type: Boolean, default: true},
    discount_applies_to: {type: String, required: true, enum: ['all', 'specific']},
    discount_products_id: {type: Array, default: []}
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})


module.exports = model(DOCUMENT_NAME, discountSchema)