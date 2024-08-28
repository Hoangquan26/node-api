'use strict'

const keytokenModel = require("../models/keytoken.model")

class KeyTokenService {
    static createKeyToken = async({ userId, publicKey, privateKey, refreshToken}) => {
        try {
            const filter = { user: userId }
            const update = { publicKey, privateKey, refreshToken, refreshTokenUsed: [] }
            const options = { upsert: true, new: true}
            const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)
            return tokens ? { publicKey, privateKey } : null
        }
        catch (err) {
            return err
        }
    }

    static findByUserId = async(userId) => {
        const keyStore = await keytokenModel.findOne({ user: userId})
        return keyStore
    }

    static removeKeyById = async(_id) => {
        const removedKey = await keytokenModel.deleteOne({_id})
        return removedKey
    }

    static findByTokenUsed = async(refreshToken) => {
        const keyStore = await keytokenModel.findOne({ refreshTokensUsed: refreshToken} )
        return keyStore
    }

    static findByToken = async(refreshToken) => {
        const keyStore = await keytokenModel.findOne({ refreshToken: refreshToken} )
        return keyStore
    }
}

module.exports = KeyTokenService