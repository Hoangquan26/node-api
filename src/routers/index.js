'use strict'

const express = require('express')
const { apiKeyMiddleware, permissionsMiddleware } = require('../auth/checkAuth')
const router = express.Router()

//check api key

router.use(apiKeyMiddleware)
router.use(permissionsMiddleware('0000'))

//check permission


router.use('/v1/api', require('./access/index'))
router.use('/v1/api/product', require('./product/index'))

module.exports = router