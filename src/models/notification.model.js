'use strict'

const { Types, SChema, model, Schema } = require('mongoose')
const DOCUMENT_NAME = 'notification'
const COLLECTION_NAME = 'notifications'

/*
type-notify:
ORDER_001: create new order success
ORDER_002: order failed
PROMOTION_001: new discount
PROMOTION_002: discount expired
SHOP-001: new product by following
*/
const notificationSchema = new Schema ({
    noti_type: { type: String, enum: ['ORDER_001', 'ORDER_002', 'PROMOTION_001', 'PROMOTION_002', 'SHOP_001'], required: true },
    noti_sender: { type: Types.ObjectId, required: true, ref: 'Shop'},
    noti_received:{ type: Types.ObjectId, required: true, ref: 'Shop'},
    noti_content: { type: String, default: ''},
    noti_options: { type: Object, default: {}}
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME, notificationSchema)