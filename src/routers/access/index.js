'use strict'
const express = require('express')
const { authentication, authenticationV2 } = require('../../auth/authUtils')
const router = express.Router()
const accessController = require('../../controllers/access.controller')
const asyncHandle = require('../../helpers/asyncHandle')


router.post('/shop/signup', asyncHandle(accessController.signup))
router.post('/shop/login', asyncHandle(accessController.login))

//use authenticate middleware
router.use(authenticationV2)
router.post('/shop/logout', asyncHandle(accessController.logout))
router.post('/shop/handleToken', asyncHandle(accessController.handleRfToken))
module.exports = router