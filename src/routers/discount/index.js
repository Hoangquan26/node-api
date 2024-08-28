'use strict'

const express = require('express')
const router = express.Router();

const DiscountController = require('../../controllers/discount.controller')
const { authen } = require('../../auth/authUtils')


module.exports = router