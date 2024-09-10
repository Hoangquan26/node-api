'use strict'

const { BadRequestError } = require("../core/error.response")
const { findUserCart } = require("../models/repositories/repo.cart")
const { checkServerProducts } = require("../models/repositories/repo.product")
const DiscountService = require("./discount.service")

class CheckoutService {
    /*
    {
        cartId,
        userId,
        shop_order_ids: [
            {
                shopId,
                shop_discounts: [
                    {
                        discount_code:
                        shopId:
                        discount_id:
                    }
                ]
                products: [
                    {
                        productId,
                        shopId,
                        product_quantity
                    }
                ]
            }
        ]
    }
    */
    static checkoutReview = async({
        userId, cartId, shop_order_ids
    }) => {
        //1. kiem tra cart ton tai
        const foundCart =  await findUserCart({ userId })
        if(!foundCart) throw new BadRequestError('Cart Error!')

        //2. tinh tien va kiem tra san pham
        const totalCheckout = {
            totalPrice: 0,
            feeShip: 0,
            discountAmount: 0,
            checkoutPrice: 0
        }, shop_order_ids_new = []
        if(!shop_order_ids) throw new BadRequestError('Cart Error')
        //lap lai qua tung san pham / shop
        for(let i = 0; i < shop_order_ids.length; i++) {
            //kiem tra san pham trong server va lay them gia tri product_price
            const { products = [], shop_discounts = [], shopId } = shop_order_ids[i]
            const serverProducts = await checkServerProducts({
                products,
                shopId
            })
            if(!serverProducts) throw new BadRequestError('Order wrong!')

            //tinh toan tong so tien
            const totalPrice = serverProducts.reduce((acc, product) => {
                return acc + (product.product_price * product.product_quantity)
            }, 0)

            const itemCheckout = {
                totalPrice: totalPrice,
                discountAmount: 0,
                checkoutPrice: totalPrice,
                products: [
                    ...serverProducts,
                    ...this.products || []
                ],
                shop_discounts
            }

            totalCheckout.totalPrice += itemCheckout.totalPrice
            
            //tinh toan discount amount 
            if(shop_discounts.length) {
                const totalDiscount = await Promise.all(shop_discounts.map(async(discount) => {
                    try {
                        const { discountAmount } = await DiscountService.getDiscountAmount({ discount_code: discount.discount_code, discount_shopId: shopId, products: serverProducts, userId })
                        return discountAmount
                    }
                    catch {
                        return 0
                    }
                }))

                totalDiscount.forEach(amount => itemCheckout.discountAmount += amount)
                totalCheckout.discountAmount += itemCheckout.discountAmount
                if(itemCheckout.discountAmount)
                    itemCheckout.checkoutPrice = itemCheckout.totalPrice - itemCheckout.discountAmount
            }

            totalCheckout.checkoutPrice += itemCheckout.checkoutPrice
            shop_order_ids_new.push(itemCheckout)
        }
        
        return {
            totalCheckout, 
            shop_order_ids,
            shop_order_ids_new
        }
    }
}

module.exports = CheckoutService