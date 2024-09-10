'use strict'

const { OK } = require("../core/success.response")
const CheckoutService = require("../services/checkout.service")

class CheckoutController {
    static checkoutReview = async(req, res, next) => {
        new OK({
            message: "Review checkout ok",
            metadata: await CheckoutService.checkoutReview({
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    }
}

module.exports = CheckoutController