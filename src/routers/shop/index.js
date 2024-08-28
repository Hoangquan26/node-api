'use strict'

const express = require('express')
const { authenticationV2 } = require('../../auth/authUtils')

const router = express.Router()


router.use(authenticationV2)

