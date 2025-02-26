'use strict'

const AccessService = require("../services/access.service")
const { OK, CREATED } = require('../core/success.response')
class AccessController {

    handleRfToken = async( req, res , next ) => {
        console.log('here')
        new OK({
            message: 'Get token success',
            metadata: await AccessService.handleRfTokenV2({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore
            })
        }).send(res)
    }

    logout = async( req, res, next ) => {
        new OK({
            message: 'Logout OK',
            metadata: await AccessService.logout(req.keyStore)
        }).send(res, {
            
        })
    }

    login = async( req, res, next ) => {
        new OK({
            message: 'Login OK',
            metadata: await AccessService.login({...req.body})
        }).send(res)
    } 

    signup = async (req, res, next) => {
        new CREATED({
            message: 'Registered OK!', 
            metadata: await AccessService.signup({ ...req.body })
        }).send(res)
        
    }
}

module.exports = new AccessController