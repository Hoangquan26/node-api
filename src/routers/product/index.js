'use strict'
const express = require('express')

const { authenticationV2 } = require('../../auth/authUtils')
const ProductController = require('../../controllers/product.controller')
const asyncHandle = require('../../helpers/asyncHandle')
const router = express.Router()

router.get('/search/:keySearch', asyncHandle(ProductController.searchProductByUser))
router.get('/all', asyncHandle(ProductController.findAllProduct))
router.get('/:product_id', asyncHandle(ProductController.findOneProduct))
router.use(authenticationV2)

router.post('', asyncHandle(ProductController.createProduct))
router.patch('/:product_id', asyncHandle(ProductController.updateProduct))
router.get('/drafts/all', asyncHandle(ProductController.getDraftProductForShop))
router.get('/publics/all', asyncHandle(ProductController.getPublicProductForShop))

router.post('/draft/:id', asyncHandle(ProductController.draftProductByShop))
router.post('/public/:id', asyncHandle(ProductController.publicProductByShop))

module.exports = router