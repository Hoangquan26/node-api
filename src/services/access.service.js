'use strict'
const jwt = require('jsonwebtoken')
const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt') 
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair } = require("../auth/authUtils")
const { getInstancesData, generateKeys, verifyJWT } = require('../utils')
const { BadRequestError, AuthenticateError, ForbiddenError } = require('../core/error.response')
const ShopService = require('./shop.service')
const { createKeyToken } = require('./keyToken.service')
const { findByEmail } = require('./shop.service')
const { keys } = require('lodash')

const RoleShop = {
    SHOP: '001',
    WRITER: '002',
    EDITOR: '003',
    ADMIN: '004'
}
class AccessService {
    static handleRfTokenV2 = async({ refreshToken, user, keyStore }) => {
        const { userId, email } = user
        if(keyStore.refreshTokensUsed.includes(refreshToken)) {
            await KeyTokenService.removeKeyById(keyStore._id)
            throw new ForbiddenError('Something wrong happened!')
        }
        
        if(keyStore.refreshToken !== refreshToken)
            throw new BadRequestError('Shop wasn\'t registered!')

        const holderShop = await ShopService.findByEmail({ email })
        if(!holderShop)  throw new BadRequestError('Shop wasn\'t registered!')

        const tokens = await createTokenPair( {userId, email}, keyStore.publicKey, keyStore.privateKey )
        keyStore.refreshToken = tokens.refreshToken
        keyStore.refreshTokensUsed.push(refreshToken)
        keyStore.save()
        return {
            shop: {userId, email},
            tokens
        }
    }

    static handleRfToken = async({ refreshToken }) => {

        const keyStore = await KeyTokenService.findByTokenUsed(refreshToken)
        if(keyStore) {
            const {userId, email} = verifyJWT(refreshToken, keyStore.privateKey)
            await KeyTokenService.removeKeyById(userId)
            throw new ForbiddenError('Something wrong happened!')
        }

        const holderKey = await KeyTokenService.findByToken(refreshToken)
        if(!holderKey) throw new BadRequestError('Shop wasn\'t registered!')
        const {userId, email} = verifyJWT(refreshToken, holderKey.privateKey)
        const holderShop = await findByEmail({email})
        if(!holderShop) throw new BadRequestError('Shop wasn\'t registered!')

        //update key
        const tokens = await createTokenPair({userId, email}, holderKey.publicKey, holderKey.privateKey)
        if(!tokens) throw new BadRequestError('Generate tokens error')

        //update keyStore
        holderKey.refreshToken = tokens.refreshToken
        holderKey.refreshTokensUsed.push(refreshToken)
        holderKey.save()
        return {
            shop: {userId, email},
            tokens
        }
    }

    static signup = async({ name, email, password }) => {
        //step1: check email
        const holderShop = await shopModel.findOne({ email }).lean()
        if(holderShop) throw new BadRequestError('Error: Shop was registered')

        const hashedPassword = await bcrypt.hash(password, 10)
        const newShop = await shopModel.create({
            name, email, password: hashedPassword, roles: [RoleShop.SHOP]
        })
        
        if(newShop) {
            /*created privateKey, publicKey thuật toán bất đối xứng
            const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: 'pkcs1',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs1',
                    format: 'pem'
                }
            })
            */
            const { publicKey, privateKey } = generateKeys()
            // console.log(`[P]::{privateKey, publicKey}::` ,{ privateKey, publicKey })

            
            //privateKey, publicKey 's type is buffer now

            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey
            })
            if(!keyStore) 
            throw new BadRequestError('Error: Keystore Error')
            
            /*chuyển base 64 sang publicKeyObject thuần bởi: nếu không có option publicKeyEncoding: {
                    type: 'pkcs1',
                    format: 'pem'
                },
            public key mặc định dạng object và không lưu được vào db
            const publicKeyToObject = crypto.createPublicKey(publicKeyString)
            */
            // console.log(`[P]::{publicKeyToObject}::` ,{ publicKeyToObject })

            const { accessToken, refreshToken} = await createTokenPair( { userId: newShop._id, email}, publicKey, privateKey)
        
            return {
                shop: getInstancesData({  object: newShop, fields: [ '_id', 'name', 'email'] }),
                tokens : {
                    accessToken, 
                    refreshToken
                }
            }
        }
        return {
            metadata: null
        }
    }
    

    static login = async({ email, password, refreshToken = null }) => {
        const foundShop = await ShopService.findByEmail({email})
        if(!foundShop) throw new BadRequestError('Email wasn\'t registered!')


        const matchPassword = bcrypt.compareSync(password, foundShop.password)
        if(!matchPassword) throw new AuthenticateError('Authenticated Error!')
        console.log(`[P]::matchPassword::`, matchPassword)

        const { _id: userId } = foundShop
        const { publicKey, privateKey } = generateKeys()

        const tokens = await createTokenPair({ userId, email: foundShop.email }, publicKey, privateKey)

        console.log(`[P]::tokens::`, tokens)
        if(!tokens) throw new BadRequestError()


        const keyStore = await KeyTokenService.createKeyToken({
            publicKey,
            privateKey,
            userId,
            refreshToken: tokens.refreshToken
        })        
        if(!keyStore)  throw new BadRequestError('Error: Keystore Error')

        return {
            shop: getInstancesData({ object: foundShop, fields: [ '_id', 'name', 'email']  }),
            tokens
        }
    }

    static logout = async(keyStore) => {
        console.log('[P]::keyStore::', keyStore)
        const removedKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log(removedKey)
        return {
            removedKey
        }
    }
}

module.exports = AccessService