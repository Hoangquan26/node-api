'use strict'
const { StatusCodes, ReasonPhrases } = require('../helpers/statuscode/httpStatusCode')

class SuccessResponse {
    constructor ({ message, statusCode, reasonPhase, metadata = {}, options = {}}) {
        this.message = !message ? reasonPhase : message
        this.status = statusCode
        this.metadata = metadata
        this.options = options
    }

    send = (res, headers = {}) => {
        //wasnt tested header
        const emptyHeaders = headers => Object.keys(headers).length === 0
        if(!emptyHeaders) {
            console.log('::set header::')
            res.set(headers)
        }
        return res.status(this.status).json(this)
    }
}

class OK extends SuccessResponse {
    constructor ({ message, statusCode = StatusCodes.OK, reasonPhase = ReasonPhrases.OK, metadata = {}, options = {} }) {
        super({message, statusCode, reasonPhase, metadata, options})
    }
}


class CREATED extends SuccessResponse {
    constructor ({ message, statusCode = StatusCodes.CREATED, reasonPhase = ReasonPhrases.CREATED, metadata = {}, options = {} }) {
        super({message, statusCode, reasonPhase, metadata, options})
    }
}

module.exports = {
    OK
    ,CREATED
}