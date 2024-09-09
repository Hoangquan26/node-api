'use strict'

const { BadRequestError } = require("../core/error.response")
const { findUserCart } = require("../models/repositories/repo.cart")
const { checkServerProducts } = require("../models/repositories/repo.product")

class CheckoutService {
    /*
    {
        cartId,
        userId,
        shop_order_ids: [
            {
                shopId
                shop_discounts: [
                    {
                        code:
                        shopId:
                        discount_id:
                    }
                ]
                products: [
                    {
                        product_id,
                        shop_id,
                        quantity
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
            firstTotal: 0,
            feeShip: 0,
            discountAmount: 0,
            lastTotal: 0
        }
        if(!shop_order_ids) throw new BadRequestError('Cart Error')
        //lap lai qua tung san pham / shop
        for(i = 0; i < shop_order_ids.length; i++) {
            const totalProduct = {
                total: 0,
                discountAmount: 0,
                lastTotal: 0
            }
            //kiem tra san pham trong server va lay them gia tri product_price
            const serverProducts = await checkServerProducts({
                products: shop_order_id[i].products,
                shopId: shop_order_id[i].shopId
            })

            //tinh toan tong so tien
            const totalPrice = serverProducts.reduce((acc, product) => {
                return acc + (product.product_price * product.product_quantity)
            }, 0)
            totalProduct.total += totalPrice
            totalCheckout += totalProduct.total
            
            //tinh toan discount amount 
            
            

        }
        
    }
}