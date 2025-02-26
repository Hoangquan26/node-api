'use strict'

const inventoryModel = require("../inventory.model")

const createInventory = async({
    inven_shopId,
    inven_productId,
    inven_stock,
    inven_location= "HN"
}) => {
    return await inventoryModel.create({
        inven_shopId,
        inven_productId,
        inven_stock,
        inven_location
    })
}

const reservationInventory = async({productId, product_quantity, cartId}) => {
    const query = {
        inven_productId: productId,
        $gte: {
            inven_stock: product_quantity
        }
    }
    const update = {
        $inc: {
            inven_stock: -product_quantity
        },
        $push: {
            inven_reservations: {
                cartId,
                quantity,
                reservationTime: new Date()
            }
        }
    }

    const option = { upsert: true, new: true }

    return await inventoryModel.updateOne(query, update, option)
}

module.exports = {
    createInventory,
    reservationInventory
}