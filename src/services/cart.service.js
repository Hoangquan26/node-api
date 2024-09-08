'use strict'

const cartModel = require("../models/cart.model")
const { getProductById, findOneProductSelect } = require("../models/repositories/repo.product")
const { convertObjectIdMongoDB } = require("../utils")

/*

---CART SERVICE---
1. Add product to cart [User]
2. Reduce product quantity by one [User]
3. Increase product quantity by one [User]
4. Get cart [User] 
5. Delete cart [User]
6. Delete cart item [User]
*/

class CartService {

    ///REPO
    static createUserCart = async({ userId, product = {} }) => {
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

    static findUserCart = async({ userId})  => {
        const query = {
            cart_userId: convertObjectIdMongoDB(userId),
            cart_status: 'active',
        }
        return await cartModel.findOne(query)
    }

    ///END REPO
    static addToCart = async({ userId, product = {} }) => {
        const foundCart = await CartService.findUserCart({ userId })
        const {productId, product_quantity} = product
        const foundProduct = {
            ...await findOneProductSelect({
                select: ['product_name', 'product_price'],
                product_id: productId
            }),
            ...product
        }

        if(!foundCart) {
            return await CartService.createUserCart({userId, product: foundProduct})
        } 
        if(foundCart.cart_product.length == 0) {
            foundCart.cart_product = [foundProduct]
            foundCart.cart_product_count += 1;
            return await foundCart.save()
        }
        else {
            const productExist = foundCart.cart_product.find(item => item.productId == productId)
            if(productExist) {
                productExist.product_quantity += product_quantity
                foundCart.markModified('cart_product')
            }
            else {
                foundCart.cart_product.push(foundProduct)
                foundCart.cart_product_count += 1;
            }
            return await foundCart.save()
        }
    }

    /*
    shop_order_ids: [
        {
            shopId, 
            item_products: [
                {
                    shopId,
                    product_quantity,
                    old_quantity,
                    product_price,
                    productId
                }
            ],
            version
        }
    ]
    */
    static updateCartProductQuantity = async({userId, shop_order_ids = []}) => {
        const { productId, product_quantity, product_old_quantity} = shop_order_ids[0]?.item_products[0]
        const foundProduct = await getProductById(productId)
        if(!foundProduct) throw new BadRequestError('Not found product')
        const validProductShop = foundProduct.product_shop.toString() == shop_order_ids[0]?.shopId
        if(!validProductShop) throw new BadRequestError('Product do not belong to the shop')
        //delete product if new product_quantity == 0
        if(product_quantity === 0) {
            CartService.deleteUserCartItem({ userId, productId })
        } 
        const query = {
            cart_userId: convertObjectIdMongoDB(userId),
            cart_status: 'active',
            'cart_product.productId': productId
        }, 
        update = {
            $inc : {
                'cart_product.$.product_quantity': product_quantity - product_old_quantity
            }
        },
        options = {
            new: true
        }

        return await cartModel.findOneAndUpdate(query, update, options)
    }

    static deleteUserCartItem = async ({ userId, productId }) => {
        const query = {
            cart_userId: convertObjectIdMongoDB(userId),
            cart_status: 'active'
        }
        const updateSet = {
            $pull: {
                cart_product: {
                    productId
                }
            },
            $inc: {
                cart_product_count: -1
            }
        }
        return await cartModel.updateOne(query, updateSet)
    }

    static getListCart = async({ userId }) => {
        return await cartModel.findOne({
            cart_userId: convertObjectIdMongoDB(userId),
            cart_status: 'active'
        }).lean()
    }
}

module.exports = CartService