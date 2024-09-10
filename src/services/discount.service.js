'use strict'

const { 
    BadRequestError,
    NotFoundError,
    ForbiddenError
} = require('../core/error.response')
const deleted_discountModel = require('../models/deleted_discount.model')
const discountModel = require('../models/discount.model')
const { findOneDiscount, findAllDiscountUnselect, updateDiscountById, findOneDiscountSelect } = require('../models/repositories/repo.discount')
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
    static insertDiscount = async({
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
    }) => {
        if(new Date(discount_start_date) > new Date() || new Date(discount_end_date) < new Date())
            throw new BadRequestError('Discount code has expired!')

        if(new Date(discount_start_date) > new Date(discount_end_date))
            throw new BadRequestError('Discount code has expired!')

        const foundDiscount = await findOneDiscountSelect({
            discount_code,
            discount_shopId: convertObjectIdMongoDB(discount_shopId)
        })
        if(foundDiscount && foundDiscount.discount_is_active)  throw new BadRequestError('Discount was exist')

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

    static updateDiscount = async(payload) => {
        const {discount_code, discount_shopId} = payload
        const {discount_type, discount_applies_to} = payload
        if(discount_type) {
            if(!['fixed_amount', 'percentage'].includes(discount_type)) throw new BadRequestError(`Discount_type:${discount_type} is invalid`)
        }

        if(discount_applies_to) {
            if(!['all', 'specific'].includes(discount_applies_to)) throw new BadRequestError(`Discount_type:${discount_applies_to} is invalid`)
        }

        const clearPayload = clearUpdateNestedValue(payload)

        const foundDiscount = await findOneDiscountSelect({
            discount_code,
            discount_shopId: convertObjectIdMongoDB(discount_shopId)
        }, ['_id'])

        return await updateDiscountById({ discount_id: foundDiscount._id, payload: clearPayload })
    }

    static findAllProductAvailable = async({
        discount_shopId,
        discount_code,
        limit = 50, 
        page = 1, 
        select = ['product_name', 'product_thumb', 'product_price'], 
        sort = {product_id: -1}
    }) => {

        const foundDiscount = await findOneDiscountSelect({
            discount_shopId,
            discount_code
        })

        if(!foundDiscount || !foundDiscount.discount_is_active) throw new NotFoundError('Discount wasn\'t exist')

        const filter = {
            product_shop: convertObjectIdMongoDB(discount_shopId),
            isPublic: true
        }
        const {discount_applies_to, discount_products_id} = foundDiscount
        if(discount_applies_to === 'specific') 
            filter['_id'] = {$in: discount_products_id}
        
        console.log(filter)
        const products = await findAllProduct({
            filter, limit, page, select, sort
        })
        console.log("....",products)
        return products
    }

    static getAllDiscountCodesByShop = async({
        discount_shopId,
        limit = 25,
        page = 1,
        sort = {create_at: 1},
        unSelectData = ['__v', 'discount_shopId']
    }) => {
        const filter = {
            discount_shopId,
            discount_is_active: true
        }   
        const foundDiscounts = await findAllDiscountUnselect({
            filter, limit, page, sort, unSelectData
        })

        return foundDiscounts
    }

    static getDiscountAmount = async({
        discount_code,
        discount_shopId,
        products,
        userId
    }) => {
        const foundDiscount = await findOneDiscountSelect({
            discount_code,
            discount_shopId
        })        
        if(!foundDiscount) throw new BadRequestError('Not found discount')
        // check if product availiable
        const { 
            discount_products_id, 
            discount_start_date, 
            discount_end_date, 
            discount_min_order_value, 
            discount_is_active, 
            discount_max_uses, 
            discount_user_used, 
            discount_max_uses_per_user ,
            discount_applies_to
        } = foundDiscount
        if(!discount_is_active) throw new BadRequestError('Discount is expired')
        if(!discount_max_uses) throw new BadRequestError('Discount is expired')
        const validDiscountUseTime = new Date(discount_start_date) <= new Date() && new Date() <= new Date(discount_end_date)
        if(!validDiscountUseTime) throw new BadRequestError('Discount expired')
        if(discount_applies_to === 'specific') {
            const validDiscountProduct = products.some(product => discount_products_id.includes(product._id.toString()))
            if(!validDiscountProduct) throw new BadRequestError('Product isn\'t valiable in this discount')
        }
        const userUsed = discount_user_used.find(user => user === userId)
        if(userUsed) {
            const validUserUsedTime = userUsed.length < discount_max_uses_per_user
            if(!validUserUsedTime) throw new BadRequestError('Out of time used')
        }
        const {discount_type, discount_value} = foundDiscount
        const totalProducts = products.reduce((acc, product) => {
            return {
                totalUnDiscount: !discount_products_id.includes(product._id) && discount_applies_to === 'specific' ? acc.totalUnDiscount + (product.product_quantity * product.product_price) : acc.totalUnDiscount,
                totalInDiscount: discount_products_id.includes(product._id) || discount_applies_to === 'all' ? acc.totalInDiscount + (product.product_quantity * product.product_price) : acc.totalInDiscount,
                total: acc.total + (product.product_quantity * product.product_price)
            }
        }, {
            totalInDiscount: 0,
            totalUnDiscount: 0,
            total: 0
        })

        if(totalProducts.total < discount_min_order_value) throw new BadRequestError(`Order value muse above ${discount_min_order_value}đ`)
        const discountAmount = (discount_type === "fixed_amount") ? discount_value : (discount_value * totalProducts.totalInDiscount) / 100

        return {
            totalProducts,
            discountAmount,
            beforeDiscount: totalProducts.total - discountAmount
        }
    }

    static delecteDiscount = async({
        discount_code,
        discount_shopId
    }) => {
        const foundDiscount = await findOneDiscountSelect({
            discount_code,
            discount_shopId
        })
        if(!foundDiscount) throw new BadRequestError('Not found discount')
        
        //moved document to removed_discount
        const deletedDiscount = deleted_discountModel.create({
            ...foundDiscount,
            discount_is_active: false
        })
        if(!deletedDiscount) throw new BadRequestError('Moved discount error')

        return await discountModel.findByIdAndDelete(foundDiscount._id)

    }

    static cancelDiscount = async({
        discount_code,
        userId,
        discount_shopId
    }) => {
        const foundDiscount = await findOneDiscount({
            discount_code,
            discount_shopId
        })        
        if(!foundDiscount) throw new BadRequestError('Not found discount')
        const { discount_user_used } = foundDiscount
        console.log(discount_user_used, userId)
        const validUser = discount_user_used.includes(userId)
        if(!validUser) throw new BadRequestError("This discount wasn\'t used by you")
        //update
        foundDiscount.discount_max_uses += 1
        foundDiscount.discount_uses_count -= 1
        foundDiscount.discount_user_used.pull(userId)

        return await foundDiscount.save()
    }
}

module.exports = DiscountService