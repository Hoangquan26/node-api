'use strict'

const ApiKeyService = require("../services/apikey.service")

const HEADER = require('../helpers/headers.key')
const apiKeyMiddleware = async( req, res, next) => {
    try {

        const key = req.headers[HEADER.API_KEY]?.toString()
        if(!key)
        return res.status(403).json({
            message: 'Forbidden Error'
        })

        //check objKey
        const objKey = await ApiKeyService.findKey(key)
        if(!objKey) 
        return res.status(403).json({
            message: 'Forbidden Error'
        })

        req.objKey = objKey 
        return next()
    }
    catch (error) {
        return res.status(403).json({
            message: 'Forbidden Error'
        })
    }
}

const permissionsMiddleware = ( permission ) => {
    return ( req, res, next ) => {
        if(!req.objKey.permissions) {
            return res.status(403).json({
                message: 'permission denied'
            })
        }

        console.log("[P]::permission::", req.objKey.permissions)
        const validPermission = req.objKey.permissions.includes(permission)
        if(!validPermission) {
            return res.status(403).json({
                message: 'permission denied'
            })
        }

        return next()
    } 
}



module.exports = {
    apiKeyMiddleware,
    permissionsMiddleware
}