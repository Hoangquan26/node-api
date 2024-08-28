'use strict'
//handle error middleware
const asyncHandle = (fn) => {
    return (req, res, next) => {
        return fn(req, res, next).catch(next)
    }
}

module.exports = asyncHandle
