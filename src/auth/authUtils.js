'use strict'
const jwt = require('jsonwebtoken')
const { AuthenticateError, NotFoundError } = require('../core/error.response')
const asyncHandle = require('../helpers/asyncHandle')
const HEADER = require('../helpers/headers.key')
const KeyTokenService = require('../services/keyToken.service')


const createTokenPair = async( payload, publicKey, privateKey) => {
    try {
        const accessToken = await jwt.sign( payload, publicKey, {
            expiresIn: '2 days'
        } )
        const refreshToken = await jwt.sign( payload, privateKey, {

            expiresIn: '7 days'
        })
        return { accessToken, refreshToken}
    }
    catch (error) {

    }
}

const authentication = asyncHandle( async (req, res, next) => {
    //check userId exist
    const userId = req.headers[HEADER.CLIENT_ID]
    if(!userId) throw new AuthenticateError('Invalid Request')
    //find keyStore in db
    const keyStore = await KeyTokenService.findByUserId(userId)
    if(!keyStore) throw new NotFoundError('Invalid Request')
    //get accessToken from client
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if(!accessToken) throw new AuthenticateError('Invalid Request')
    //verify token
    try {
        const decodeUser = jwt.verify(accessToken, keyStore.publicKey)
        if(userId != decodeUser.userId) throw new AuthenticateError('Invalid UserID')
        //pass authenticate
        req.keyStore = keyStore
        return next()
    }
    catch(error){
        throw error
    }
})


const authenticationV2 = asyncHandle( async (req, res, next) => {
    //check userId exist
    const userId = req.headers[HEADER.CLIENT_ID]
    if(!userId) throw new AuthenticateError('Invalid Request')
    //find keyStore in db
    const keyStore = await KeyTokenService.findByUserId(userId)
    if(!keyStore) throw new NotFoundError('Invalid Request')
    //get rfreshToken from client
    const refreshToken = req.headers[HEADER.REFRESH_TOKEN]


    if(refreshToken) {
        const decodeUser = jwt.verify(refreshToken, keyStore.privateKey)
        if(userId != decodeUser.userId) throw new AuthenticateError('Invalid UserID')
        req.keyStore = keyStore
        req.user = decodeUser
        req.refreshToken = refreshToken
        return next()
    }
    
    //get accessToken from client
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if(!accessToken) throw new AuthenticateError('Invalid Request')
    //verify token
    try {
        const decodeUser = jwt.verify(accessToken, keyStore.publicKey)
        if(userId != decodeUser.userId) throw new AuthenticateError('Invalid UserID')
        //pass authenticate
        req.keyStore = keyStore
        req.user = decodeUser
        return next()
    }
    catch(error){
        throw error
    }
})

module.exports = {
    createTokenPair,
    authentication,
    authenticationV2
}