'use strict'

const { CREATED, OK } = require("../core/success.response")
const CartService = require("../services/cart.service")

class CartController {
    static addToCart = async(req, res, next) => {
        new CREATED({
            message: 'Insert cart succesful',
            metadata: await CartService.addToCart({
                userId: req.user.userId,
                product: req.body.product
                //product = {}
            })
        }).send(res)
    }

    static updateCartProductQuantity = async(req, res, next) => {
        new OK({
            message: 'Update product succesful',
            metadata: await CartService.updateCartProductQuantity({
                userId: req.user.userId,
                shop_order_ids: req.body.shop_order_ids
            })
        }).send(res)
    }

    static deleteUserCart = async(req, res, next) => {
        new OK({
            message: 'Delete product cart succesful',
            metadata: await CartService.deleteUserCartItem({
                userId: req.user.userId,
                productId: req.body.productId
            })
        }).send(res)
    }

    static getListCart = async(req, res, next) => {
        new OK({
            message: 'Get list cart successful',
            metadata: await CartService.getListCart({
                userId: req.user.userId
            })
        }).send(res)
    }
}

module.exports = CartController