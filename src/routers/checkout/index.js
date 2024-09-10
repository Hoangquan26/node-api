const express = require('express')
const CheckoutController = require('../../controllers/checkout.controller')
const asyncHandle = require('../../helpers/asyncHandle')
const router = express.Router()

router.post('/review', asyncHandle(CheckoutController.checkoutReview))

module.exports = router