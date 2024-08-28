'use strict'
const { CREATED, OK } = require('../core/success.response')
const ProductFactory = require('../services/product.service')
class ProductController {
    static createProduct = async (req, res, next) => {
        new CREATED({
            metadata: await ProductFactory.createProduct({
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    static updateProduct = async(req, res, next) => {
        new OK({
            metadata: await ProductFactory.updateProduct({
                product_id: req.params.product_id,
                payload: req.body
            })
        }).send(res)
    }

    /**
     * 
     * @param {ObjectID} product_id 
     * @param {Array} unSelect 
     * @return {Object}  
     */
    static findOneProduct = async(req, res, next) => {

        new OK({
            metadata: await ProductFactory.findOneProduct({
                ...req.body,
                product_id: req.params.product_id
            })
        }).send(res)
    }

    /**
     * 
     * @param {Object} filter
     * @param {Object} sort 
     * @param {Number} limit 
     * @param {Number} page
     * @param {Array<String>} select 
     * @return {Array<Object>}  
     */
    static findAllProduct = async(req, res, next) => {
        new OK({
            metadata: await ProductFactory.findAllProduct({
                ...req.body
            })
        }).send(res)
    }

    /**
     * @param {String} keySearch 
     * @returns {JSON}
    */
    static searchProductByUser = async(req, res, next) => {
        new OK({
            metadata: await ProductFactory.searchProductByUser({
                keySearch: req.params.keySearch,
            })
        }).send(res)
    }

    /**
     * @param {ObjectId} product_shop 
     * @param {Number} limit = 50
     * @param {Number} skip = 0
     * @returns {JSON}
    */
    static getPublicProductForShop = async(req, res, next) => {
        const { userId, email } = req.user
        new OK({
            metadata: await ProductFactory.getPublicProductForShop({
                product_shop: userId,
                ...req.body
            })
        }).send(res)
    }

    /**
     * @param {ObjectId} product_shop 
     * @param {Number} limit = 50
     * @param {Number} skip = 0
     * @returns {JSON}
    */
    static getDraftProductForShop = async(req, res, next) => {
        const { userId, email } = req.user
        new OK({
            metadata: await ProductFactory.getDraftProductForShop({
                product_shop: userId,
                ...req.body
            })
        }).send(res)
    }

    /**
     * @param {ObjectId} shop_id (req.user)
     * @param {ObjectId} product_shop (req.params)
     * @returns {JSON}
    */
    static publicProductByShop = async(req, res, next) => {
        const { userId, email } = req.user
        new OK({
            metadata: await ProductFactory.publicProductByShop({
                shop_id: userId,
                product_id: req.params.id
            })
        }).send(res)
    }
    /**
     * @param {ObjectId} shop_id (req.user)
     * @param {ObjectId} product_shop (req.params)
     * @returns {JSON}
    */
    static draftProductByShop = async(req, res, next) => {
        const { userId, email } = req.user
        new OK({
            metadata: await ProductFactory.draftProductByShop({
                shop_id: userId,
                product_id: req.params.id
            })
        }).send(res)
    }
}


// await ({
//     ...req.body,
//     product_shop: req.user.userId
// }).createProduct()
module.exports = ProductController