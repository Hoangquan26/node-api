'use strict'

const RedisPubsubService = require("./redis.pubsub.service")

class InventoryPubSubService {
    constructor() {
        RedisPubsubService.subscribing('purchase_product', function(channel, message) {
            InventoryPubSubService.reduceInven(message)
        })
    }

    static reduceInven = (order) => {
        console.log(`update product: ${order}`)
    }
}

class ProductPubSubServive {
    purchaseProduct = (productId, quantity) => {
        const order = {
            productId, 
            quantity
        }
        RedisPubsubService.publishing('purchase_product', JSON.stringify(order))
    }
}

const inven = new InventoryPubSubService()
module.exports = new ProductPubSubServive()