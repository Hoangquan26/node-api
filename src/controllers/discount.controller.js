'use strict'

const { CREATED, OK } = require("../core/success.response")
const DiscountService = require("../services/discount.service")

class DiscountController {
    static insertDiscount = async(req, res, next) => {
        new CREATED({
            message: "Insert discount successful",
            metadata: await DiscountService.insertDiscount({
                ...req.body,
                discount_shopId: req.user.userId
            })
        }).send(res)
    }
    static updateDiscount = async(req, res, next) => {
        new OK({
            message: "Update discount successful",
            metadata: await DiscountService.updateDiscount({
                ...req.body,
                discount_shopId: req.user.userId
            })
        }).send(res)
    }
    static findAllProductAvailable = async(req, res, next) => {
        new OK({
            message: "Find all products avaliable successful",
            metadata: await DiscountService.findAllProductAvailable({
                ...req.body
            })
        }).send(res)
    }
    static getAllDiscountCodesByShop = async(req, res, next) => {
        new OK({
            message: "Get all discount code successful",
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.body
            })
        }).send(res)
    }
    static getDiscountAmount = async(req, res, next) => {
        new OK({
            message: "Get get discount amount successful",
            metadata: await DiscountService.getDiscountAmount({
                ...req.body
            })
        }).send(res)
    }
    static delecteDiscount = async(req, res, next) => {
        new OK({
            message: "Delete discount successful",
            metadata: await DiscountService.delecteDiscount({
                ...req.body
            })
        }).send(res)
    }
    static cancelDiscount = async(req, res, next) => {
        new OK({
            message: "Cancel discount successful",
            metadata: await DiscountService.cancelDiscount({
                ...req.body
            })
        }).send(res)
    }
}

module.exports = DiscountController