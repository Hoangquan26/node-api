'use strict'

const {model, Schema, Types} = require('mongoose'); 

const DOCUMENT_NAME = "Shop"
const COLLECTION_NAME = "Shops"

const shopSchema = new Schema({
    name: {
        type: String,
        trim: true,
        maxLength: [50, 'Username must be less than 50 character'],
    },
    email: {
        type: String,
        unique: [true, 'Email was be registered'], 
        trim: true
    },
    password: {
        type: String,
        maxLength: [50, 'Password must be less than 50 character'],
        required: [true, 'Password can\'t be blank']
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive"
    },
    verify: {
        type: Schema.Types.Boolean,
        default: false
    },
    roles: {
        type: Array,
        default: []
    }

}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME, shopSchema)