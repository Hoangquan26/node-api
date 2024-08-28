'use strict'
const { getDraftProductForShop, getPublicProductForShop, draftProductByShop, publicProductByShop, searchProductByUser, findOneProduct, findAllProduct, updateProductById } = require('../models/repositories/repo.product')
const { BadRequestError } = require("../core/error.response")
const { PRODUCT_DOCUMENT_NAME } = require("../helpers/product.document.name")
const { clothingModel, electronicModel, productModel, furnitureModel } = require("../models/product.model")
const { clearUpdateNestedValue } = require('../utils')
const { createInventory } = require('../models/repositories/repo.inventory')


class ProductFactory {
    static productRegistry = {} // key - class

    static registerProductType = ( type, classRef) => {
        ProductFactory.productRegistry[type] = classRef
    }

    static createProduct = async( payload ) => {
        const {product_type} = payload 
        const productClass = ProductFactory.productRegistry[product_type]
        if(!productClass) throw new BadRequestError(`Invalid product type: ${product_type}`)

        console.log(`[P]::payload::`, payload)
        return await new productClass(payload).createProduct()
    }
   //UPDATE
    static updateProduct = async({product_id, payload }) => {
        const {product_type} = payload
        const productClass = ProductFactory.productRegistry[product_type]
        if(!productClass) throw new BadRequestError(`Invalid product type: ${product_type}`)
        return await new productClass(payload).updateProduct(product_id)
    }


 
    static updateProductByShop = async({product_id, payload}) => {
        
    }

    static draftProductByShop = async({product_id, shop_id}) => {
        return await draftProductByShop({product_id, shop_id})
    }

    static publicProductByShop = async({product_id, shop_id}) => {
        return await publicProductByShop({product_id, shop_id})
    }
    //END UPDATE

    //QUERY
    static searchProductByUser = async({ keySearch = "" }) => {
        return await searchProductByUser({keySearch})
    }

    static getDraftProductForShop = async({ product_shop, limit = 50, skip = 0 }) => {
        const query = {
            product_shop,
            isDraft: true,
            isPublic: false
        }
        return await getDraftProductForShop({ query, limit, skip})
    }

    static getPublicProductForShop = async({ product_shop, limit = 50, skip = 0 }) => {
        const query = {
            product_shop,
            isDraft: false,
            isPublic: true
        }
        return await getPublicProductForShop({ query, limit, skip})
    }

    static findOneProduct = async({unSelect = [], product_id}) => {
        return await findOneProduct({unSelect, product_id})
    }

    static findAllProduct = async({limit = 50, page = 1, select = ['product_name', 'product_thumb', 'product_price'],
     filter = {isPublic: true}, sort = {product_id: -1}}) => {
        return await findAllProduct({limit, page, select, filter, sort})
    }
 
    //END QUERY
    
}

class Product {
    constructor({ 
        product_name, product_thumb, product_price, product_quantity, 
        product_description, product_type, product_shop, product_attributes }) {
        
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_description = product_description
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
    }

    async createProduct(product_id) {
        const newProduct = await productModel.create({
            ...this,
            _id: product_id
        })
        if(newProduct) {
            await createInventory({
                inven_productId: newProduct._id,
                inven_shopId: this.product_shop,
                inven_stock: this.product_quantity
            })
        } 
        return newProduct
    }
    async updateProduct({product_id, payload}) {
        return await updateProductById({
            product_id,
            payload,
            model: productModel
        })
    }

}

class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothingModel.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newClothing) throw new BadRequestError('Create new product error!')

        const newProduct = await super.createProduct(newClothing._id)
        if(!newProduct) throw new BadRequestError('Create new product error!')
        return newProduct
    }
    async updateProduct(product_id) {
        //remove null and update input object for update function
        const payload = clearUpdateNestedValue(this)
        //check if need to update product_child
        if(this.product_attributes) {
            await updateProductById({product_id, payload: clearUpdateNestedValue(this.product_attributes), model: clothingModel})
        }

        return await super.updateProduct({product_id, payload})
    }
}


class Electronic extends Product {
    async createProduct() {
        const newElectronic = await electronicModel.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newElectronic) throw new BadRequestError('Create new product error!')

        const newProduct = await super.createProduct(newElectronic._id)
        if(!newProduct) throw new BadRequestError('Create new product error!')
        return newProduct
    }

    async updateProduct(product_id) {
        //remove null and update input object for update function
        const payload = clearUpdateNestedValue(this)
        //check if need to update product_child
        if(this.product_attributes) {
            await updateProductById({product_id, payload: clearUpdateNestedValue(this.product_attributes), model: electronicModel})
        }

        return await super.updateProduct({product_id, payload})
    }
}


class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furnitureModel.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newFurniture) throw new BadRequestError('Create new furniture error!')

        const newProduct = await super.createProduct(newFurniture._id)
        if(!newProduct) throw new BadRequestError('Create new product error!')
        return newProduct
    }

    async updateProduct(product_id) {
        const payload = clearUpdateNestedValue(this)
        //check if need to update product_child
        if(this.product_attributes) {
            await updateProductById({product_id, payload: clearUpdateNestedValue(this.product_attributes), model: furnitureModel})
        }

        return await super.updateProduct({product_id, payload})
    }
}

ProductFactory.registerProductType(PRODUCT_DOCUMENT_NAME.FURNITURE, Furniture)
ProductFactory.registerProductType(PRODUCT_DOCUMENT_NAME.CLOTHING, Clothing)
ProductFactory.registerProductType(PRODUCT_DOCUMENT_NAME.ELECTRONIC, Electronic)

module.exports = ProductFactory