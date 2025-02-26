'use strict'

const commentModel = require("../comment.model")

const getComments = async({query, limit = 50, offset = 0}) => {
    return await commentModel.find(query).skip(offset).limit(limit)
}

module.exports = {
    getComments
}