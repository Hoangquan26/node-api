'use strict'

const redis = require('redis')
const util = require('node:util')
const { reservationInventory } = require('../models/repositories/repo.inventory')

const redisClient = redis.createClient()
//promisify redis function
const pExpire = util.promisify(redisClient.pExpire).bind(redisClient)
const setNX = util.promisify(redisClient.setNX).bind(redisClient)
const del = util.promisify(redisClient.del).bind(redisClient)

const aquireLock = async({ productId, product_quantity, cartId }) => {
    const retryTime = 10
    const expireTime = 3000
    const key = `product_lock_tracking:${productId}`

    for(let i = 0; i < 10; i++) {
        const result = await setNX(key, expireTime)
        if(result) {
            const isReservation = await reservationInventory({productId, product_quantity, cartId })
            if(isReservation.modifiedCount) {
                return key
            }
            else {
                return null
            }
        }
        else {
            await new Promise((resolve) => setTimeout(resolve, 50))
        }
    }

    return null
}

const releaseLock = async(key) =>  {
    return await del(key)
}

module.exports = {
    aquireLock,
    releaseLock
}