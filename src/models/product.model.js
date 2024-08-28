'use strict'
const slugify = require('slugify')
const { Schema, model } = require('mongoose')
const { PRODUCT_DOCUMENT_NAME, PRODUCT_COLLECTION_NAME } = require('../helpers/product.document.name')


const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

//define product model

const productSchema = new Schema({
    product_name: { type: String, required: true },
    product_thumb: { type: String, required: true },
    product_price: { type: Number, required: true},
    product_quantity: { type: Number, required: true},
    product_description: { type: String },
    product_type: { type: String, required: true, enum: [...Object.values(PRODUCT_DOCUMENT_NAME)]},
    product_attributes: { type: Schema.Types.Mixed, required: true},
    product_shop : {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    },
    product_rating: {
        type: Number,
        default: 4.5,
        min: [1, 'rating must be above 1'],
        max: [5, 'rating must be above 1'],
        set: (val) => Math.round(val*10) / 10
    },
    product_slug: { type: String },
    product_variation: { type: Array, default: [] },
    isDraft: { type: Boolean, default: true, select: false, index: true},
    isPublic: { type: Boolean, default: false, select: false, index: true}
},
{
    timestamps: true,
    collection: COLLECTION_NAME
})

//create index for full text search
productSchema.index({'product_name': 'text', 'product_description': 'text'})
//create middlewate: run before create()
productSchema.pre('create', (next) => {
    this.product_slug = slugify.default(this.product_name, {
        lower: true,
        trim: true
    })
})



//define product model type: clothing
const clothingSchema = new Schema({
    brand: { type: String, required: true},
    size: String,
    material: String,
    product_shop : {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Shop'
    }
}, {
    timestamps: true,
    collection: PRODUCT_COLLECTION_NAME.CLOTHING
})

//define product model type: electronic
const electronicSchema = new Schema({
    manufactory: { type: String, required: true},
    model: String,
    color: String,
    product_shop : {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Shop'
    }
}, {
    timestamps: true,
    collection: PRODUCT_COLLECTION_NAME.ELECTRONIC
})

const furnitureSchema = new Schema({
    brand: { type: String, required: true},
    size: String,
    material: String,
    product_shop : {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Shop'
    }
}, {
    timestamps: true,
    collection: PRODUCT_COLLECTION_NAME.FURNITURE
})



module.exports = {
    productModel: model(DOCUMENT_NAME, productSchema),
    clothingModel: model(PRODUCT_DOCUMENT_NAME.CLOTHING, clothingSchema),
    electronicModel: model(PRODUCT_DOCUMENT_NAME.ELECTRONIC, electronicSchema),
    furnitureModel: model(PRODUCT_DOCUMENT_NAME.FURNITURE, furnitureSchema)
}
