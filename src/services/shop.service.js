'use strict'

const shopModel = require("../models/shop.model")

class ShopService {
    static findByEmail = async({ 
        email,
        select = {
            name: 1,
            email: 1,
            roles: 1 ,
            status: 1,
            password: 1
        }
    }) => {
        return await shopModel.findOne({email}).select(select).lean() 
    }

    
}

module.exports = ShopService