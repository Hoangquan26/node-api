'use strict'

const Logger = require('../logger/discord.logger')

const logToDiscord = (req, res, next) => {
    try {
        Logger.logCode({
            message: `API: ${req.get('host')}${req.originalUrl}`,
            title: `METHOD: ${req.method}(${new Date().toLocaleString()})`,
            code: req.method === 'GET' ? req.query : req.body,
        })

        next()
    }
    catch (e){
        return next(e)
    }
}

module.exports = {
    logToDiscord
}