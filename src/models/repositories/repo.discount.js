'use strict'

const discountModel = require('../discount.model')
const {
    readUnselectArray,
    readSelectArray
} = require('../../utils')

//query
const findOneDiscount = async(filter) => {
    return await discountModel
    .findOne(filter)
}

const findOneDiscountUnselect = async(filter, unselectData = []) => {
    return await discountModel
    .findOne(filter)
    .select(readUnselectArray(unselectData))
    .lean()
}

const findOneDiscountSelect = async(filter, selectData = []) => {
    return await discountModel
    .findOne(filter)
    .select(readSelectArray(selectData))
    .lean()
}

const findAllDiscountSelect = async(filter, selectData, limit, page, sort) => {
    const skip = (page - 1) * limit
    return await discountModel
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select(readSelectArray(selectData))
    .lean()
}

const findAllDiscountUnselect = async(filter, unSelectData, limit, page, sort) => {
    const skip = (page - 1) * limit
    return await discountModel
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select(readUnselectArray(unSelectData))
    .lean()
}


//update

const updateDiscountById = async({
    discount_id,
    payload,
    isNew = true
}) => {
    return await discountModel.findByIdAndUpdate(discount_id, payload, {
        new: isNew
    })
}

module.exports = {
    findOneDiscountSelect,
    findOneDiscountUnselect,
    findOneDiscount,
    findAllDiscountSelect,
    findAllDiscountUnselect,
    updateDiscountById
}