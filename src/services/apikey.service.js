'use strict'

const apikeyModel = require("../models/apikey.model")
const crypto = require('crypto')
class ApiKeyService {
    static createKey = async( permissions = [] ) => {
        try {
            const apiKey = apikeyModel.create({
                key: crypto.randomBytes(64).toString('hex'),
                permissions
            })
            if(!apiKey)
            return {
                code: 'xxx',
                message: 'Apikey error'
            }
            return apiKey   
        }
        catch (err) {
            return {
                code: 'xxx',
                message: 'Apikey error'
            }
        }
    }

    static findKey = async( key ) => {
        const objKey = apikeyModel.findOne({ key, status: true }).lean()
        return objKey
    }
}

module.exports = ApiKeyService