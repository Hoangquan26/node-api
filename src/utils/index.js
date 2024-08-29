'use strict'

const _ = require('lodash')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const {Types} = require('mongoose')


//mongoose

const convertObjectIdMongoDB = id => new Types.ObjectId(id)
//select metadata function
const getInstancesData = ({object = {} , fields = []}) => {
    return _.pick( object, fields )
}

const readSelectArray = (select) => {
    return Object.fromEntries(select.map((val) => [val, 1]))
}

const readUnselectArray = (unselect) => {
    return Object.fromEntries(unselect.map((val) => [val, 0])) 
}

//generate keys function

const generateKeys = () => {
    const publicKey = crypto.randomBytes(64).toString('hex')
    const privateKey = crypto.randomBytes(64).toString('hex')
    return { publicKey, privateKey }
}

const verifyJWT = (token, key) => {
    const decodeToken = jwt.verify(token, key)
    return decodeToken
}

const clearUpdateNestedValue = (object) => {
    const final = {}
    Object.keys(object).forEach((key) => {
        const val = object[key]
        if(![null, undefined].includes(val)) {
            if(typeof val == 'object' && !Array.isArray(val)) {
                const res = clearUpdateNestedValue(val)
                Object.keys(res).forEach(k => {
                    final[`${key}.${k}`] = res[k]
                })
            }
            else {
                if(Array.isArray(val))
                    final[key] = val.filter(item => ![null, undefined].includes(item))
                else
                    final[key] = val
            }
        } 
    })
    return final
}

module.exports = {
    getInstancesData,
    generateKeys,
    verifyJWT,
    readSelectArray,
    readUnselectArray,
    clearUpdateNestedValue,
    convertObjectIdMongoDB
}