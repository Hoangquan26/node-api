'use strict'

const { authenticationV2 } = require('../../auth/authUtils')
const NotificationController = require('../../controllers/notification.controller')
const asyncHandle  =  require('../../helpers/asyncHandle')

const express = require('express')
const router = express.Router()

router.get('', asyncHandle(NotificationController.listNotifyUser))

module.exports = router