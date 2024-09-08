'use strict'

const { Types } = require("mongoose")
const { readSelectArray, readUnselectArray, convertObjectIdMongoDB } = require("../../utils")
const { productModel } = require("../product.model")

//UPDATE
const updateProductById = async({product_id, payload, model, isNew = true}) => {
    return await model.findByIdAndUpdate(product_id, payload, {
        new: isNew
    })
}

const draftProductByShop = async({product_id, shop_id}) => {
    const foundProduct = await productModel.findOne({
        _id: new Types.ObjectId(product_id),
        product_shop: new Types.ObjectId(shop_id)
    })

    if(!foundProduct) return null
    foundProduct.isDraft = true
    foundProduct.isPublic = false
    return await foundProduct.save()
}

const publicProductByShop = async({product_id, shop_id}) => {
    const foundProduct = await productModel.findOne({
        _id: new Types.ObjectId(product_id),
        product_shop: new Types.ObjectId(shop_id)
    })

    if(!foundProduct) return null
    foundProduct.isDraft = false
    foundProduct.isPublic = true
    return await foundProduct.save()
}
//END UPDATE

//QUERY
const searchProductByUser = async({ keySearch}) => {
    const regexSearch = new RegExp(keySearch)
    return await productModel.find({
        $text: {$search: regexSearch}
    },{
        score: {$meta: 'textScore'}
    }).sort({score: {$meta: 'textScore'}})
    .lean()
}

const getDraftProductForShop = async ({ query, limit, skip}) => {
    return await queryProducts({query, limit, skip})
}

const getPublicProductForShop = async ({ query, limit, skip}) => {
    return await queryProducts({query, limit, skip})
}

const queryProducts = async({query, limit, skip}) => {
    const products = await productModel.find(query)
    .populate('product_shop', 'name email -_id')
    .sort({updateAt: -1})
    .skip(skip)
    .limit(limit)
    .lean()
    return products
}

const findOneProduct = async({unSelect, product_id}) => {
    return await productModel.find({
        _id: new Types.ObjectId(product_id)
    })
    .select(readUnselectArray(unSelect))
    .lean()
}

const findOneProductSelect = async({select, product_id}) => {
    return await productModel.findOne({
        _id: new Types.ObjectId(product_id)
    })
    .select(readSelectArray(select))
    .lean()
}

const findAllProduct = async({limit, page, select, filter, sort}) => {
    const skip = (page - 1) * limit
    return await productModel.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select(readSelectArray(select))
    .lean()
}

const getProductById = async(productId) => {
    return await productModel.findOne({
        _id: convertObjectIdMongoDB(productId),
        isPublic: true
    }).lean()
}
//END QUERY
module.exports = {
    getDraftProductForShop,
    getPublicProductForShop,
    draftProductByShop,
    publicProductByShop,
    findOneProduct,
    findAllProduct,
    searchProductByUser,
    updateProductById,
    getProductById,
    findOneProductSelect
}