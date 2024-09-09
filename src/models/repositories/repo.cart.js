'use strict'

const { convertObjectIdMongoDB, readSelectArray } = require("../../utils")
const cartModel = require("../cart.model")
const { productModel } = require("../product.model")

///REPO
const createUserCart = async({ userId, product = {} }) => {
    const query = {
        cart_userId: convertObjectIdMongoDB(userId),
        cart_status: 'active'
    }
    const updateOrInsert = {
        $addToSet: {
            cart_product: product
        },
        $inc: {
            cart_product_count: product.length
        }
    }
    const options = { upsert: true, new: true }
    return await cartModel.findOneAndUpdate(query, updateOrInsert, options)

}

const findUserCart = async({ userId})  => {
    const query = {
        cart_userId: convertObjectIdMongoDB(userId),
        cart_status: 'active',
    }
    return await cartModel.findOne(query)
}

///END REPO

module.exports = {
    createUserCart,
    findUserCart
}