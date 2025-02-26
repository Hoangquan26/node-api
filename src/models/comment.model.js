'use strict'

const DOCUMENT_NAME = 'comment'
const COLLECTION_NAME = 'comments'

const { Types, Schema, model } = require('mongoose')

const CommentSchema = new Schema({
    comment_content: { type: String, default: "" },
    comment_parentId: { type: Types.ObjectId, ref: DOCUMENT_NAME },
    comment_leftNode: {type: Number, default: 0},
    comment_rightNode: {type: Number, default: 0},
    comment_productId: { type: Types.ObjectId, required: true, ref: 'Product' },
    comment_userId: { type: Types.ObjectId, ref: 'Shop', required: true },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME, CommentSchema)