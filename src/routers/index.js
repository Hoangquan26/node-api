'use strict'

const express = require('express')
const { apiKeyMiddleware, permissionsMiddleware } = require('../auth/checkAuth')
const { logToDiscord } = require('../middleware')

const router = express.Router()



//check api key

router.use(apiKeyMiddleware)
router.use(permissionsMiddleware('0000'))
router.use(logToDiscord)
//check permission

router.use('/v1/api', require('./access/index'))
router.use('/v1/api/comment', require('./comment/index'))
router.use('/v1/api/checkout', require('./checkout/index'))
router.use('/v1/api/product', require('./product/index'))
router.use('/v1/api/discount', require('./discount/index'))
router.use('/v1/api/cart', require('./cart/index'))
router.use('/v1/api/notification', require('./notification/index'))


module.exports = router