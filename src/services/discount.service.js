'use strict'

const { 
    BadRequestError,
    NotFoundError,
    ForbiddenError
} = require('../core/error.response')
const deleted_discountModel = require('../models/deleted_discount.model')
const discountModel = require('../models/discount.model')
const { findOneDiscount, findAllDiscountUnselect, updateDiscountById } = require('../models/repositories/repo.discount')
const { findAllProduct } = require('../models/repositories/repo.product')
const { convertObjectIdMongoDB, clearUpdateNestedValue } = require('../utils')
 
/*
    Discount Services

    1. Generate Discount [Admin|Shop]
    2. Get discount amount [User]
    3. Get all discount codes [User|Shop]
    4. Verify discount code [User]
    5. Delete discount code [Admin|Shop]
    6. Cancel discount code [User]
*/

class DiscountService {
    static insertDiscount = async(payload) => {
        const {
            discount_name,
            discount_description,
            discount_type,
            discount_value,
            discount_code,
            discount_start_date,
            discount_end_date,
            discount_max_uses,
            discount_uses_count,
            discount_max_uses_per_user,
            discount_min_order_value,
            discount_shopId,
            discount_is_active,
            discount_applies_to,
            discount_products_id
        } = payload
        if(new Date(discount_start_date) > new Date() || new Date(discount_end_date) < new Date())
            throw new BadRequestError('Discount code has expired!')

        if(new Date(discount_start_date) > new Date(discount_end_date))
            throw new BadRequestError('Discount code has expired!')

        const foundDiscount = await findOneDiscountSelect({
            discount_code,
            discount_shopId: convertObjectIdMongoDB(discount_shopId)
        })
        if(foundShop && foundShop.discount_is_active)  throw new BadRequestError('Discount was exist')

        const newDiscount = await discountModel.create({
            discount_name,
            discount_description,
            discount_type,
            discount_value,
            discount_code,
            discount_start_date: new Date(discount_start_date),
            discount_end_date: new Date(discount_end_date),
            discount_max_uses,
            discount_uses_count: discount_uses_count ?? 0,
            discount_max_uses_per_user,
            discount_min_order_value,
            discount_shopId,
            discount_is_active,
            discount_applies_to,
            discount_products_id: discount_applies_to === 'all' ? [] : discount_products_id
        })

        if(!newDiscount) throw new ForbiddenError('Create discount error!')
        return newDiscount
    }   

    static updateDiscount = async({
        code, 
        shopId,
        payload
    }) => {
        const clearPayload = clearUpdateNestedValue(payload)
        const foundDiscount = await findOneDiscountSelect({
            discount_code,
            discount_shopId: convertObjectIdMongoDB(discount_shopId)
        }, ['_id'])

        return await updateDiscountById({ discount_id: foundDiscount._id, payload: clearPayload })
    }

    static findAllProductAvailable = async({
        shopId,
        code,
        userId,
        limit = 50, 
        page = 1, 
        select = ['product_name', 'product_thumb', 'product_price'], 
        sort = {product_id: -1}
    }) => {

        const foundDiscount = await findOneDiscountSelect({
            discount_shopId: shopId,
            discount_code: code
        })
        if(!foundDiscount || !foundDiscount.discount_is_active) throw new NotFoundError('Discount wasn\'t exist')

        const filter = {
            product_shop: convertObjectIdMongoDB(shopId),
            isPublic: true
        }
        const {discount_applies_to, discount_products_id} = foundDiscount
        if(discount_applies_to === 'specific') 
            filter['_id'] = {$in: {discount_products_id}}
            
        const products = await findAllProduct({
            filter, limit, page, select, sort
        })

        return products
    }

    static getAllDiscountCodesByShop = async({
        shopId,
        limit = 25,
        page = 1,
        sort = {create_at: 1},
        unSelectData = ['__v', 'discount_shopId']
    }) => {
        const filter = {
            discount_shopId: shopId,
            discount_is_active: true
        }   

        const foundDiscounts = await findAllDiscountUnselect({
            filter, limit, page, sort, unSelectData
        })

        return foundDiscounts
    }

    static getDiscountAmount = async({
        code,
        shopId,
        products,
        userId
    }) => {
        const foundDiscount = await findOneDiscountSelect({
            discount_code: code,
            discount_shopId: shopId
        })        
        if(!foundDiscount) throw new BadRequestError('Not found discount')
        // check if product availiable
        const { discount_products_id, discount_start_date, discount_end_date, discount_min_order_value, discount_is_active, discount_max_uses, discount_user_used, discount_max_uses_per_user } = foundDiscount
        if(!discount_is_active) throw new BadRequestError('Discount is expired')
        if(!discount_max_uses) throw new BadRequestError('Discount is expired')
        const validDiscountUseTime = new Date(discount_start_date) <= new Date() && new Date() <= new Date(discount_end_date)
        if(!validDiscountUseTime) throw new BadRequestError('Discount expired')
        const validDiscountProduct = products.some(product => discount_products_id.includes(product))
        if(!validDiscountProduct) throw new BadRequestError('Product isn\'t valiable in this discount')

        const userUsed = discount_user_used.find(user => user === userId)
        const validUserUsedTime = userUsed.length < discount_max_uses_per_user
        if(!validUserUsedTime) throw new BadRequestError('Out of time used')

        const {discount_type, discount_value} = foundDiscount
        const totalProducts = products.reduce((acc, product) => {
            return product.product_quantity * product.product_price
        })

        if(totalProducts < discount_min_order_value) throw new BadRequestError(`Order value muse above ${discount_min_order_value}đ`)

        const discountAmount = (discount_type === "fixed_amount") ? discount_value : discount_value * totalProducts

        return {
            totalProducts,
            discountAmount,
            beforeDiscount: totalProducts - discountAmount
        }
    }

    static delecteDiscount = async({
        code,
        shopId
    }) => {
        const foundDiscount = await findOneDiscountSelect({
            discount_code: code,
            discount_shopId: shopId
        })        
        if(!foundDiscount) throw new BadRequestError('Not found discount')
        
        //moved document to removed_discount
        const deletedDiscount = deleted_discountModel.create(foundDiscount)
        if(!deletedDiscount) throw new BadRequestError('Moved discount error')

        return await discountModel.deleteOne({_id: foundDiscount._id})

    }

    static cancelDiscount = async({
        code,
        userId,
        shopId
    }) => {
        const foundDiscount = await findOneDiscount({
            discount_code: code,
            discount_shopId: shopId
        })        
        if(!foundDiscount) throw new BadRequestError('Not found discount')
        const { discount_user_used} = foundDiscount
        const validUser = discount_user_used.includes(userId)
        if(!validUser) throw new BadRequestError("This discount wasn\'t used by you")

        //update
        foundDiscount.discount_max_uses += 1
        foundDiscount.discount_uses_count -= 1
        foundDiscount.discount_user_used.pull(shopId)

        return await foundDiscount.save()
    }
}

module.exports = DiscountService