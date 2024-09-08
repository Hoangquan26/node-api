const express = require('express')
const CartController = require('../../controllers/cart.controller')
const asyncHandle = require('../../helpers/asyncHandle')
const router = express.Router()

router.get('/', asyncHandle(CartController.getListCart))
router.delete('/', asyncHandle(CartController.deleteUserCart))
router.post('/', asyncHandle(CartController.addToCart))
router.post('/update', asyncHandle(CartController.updateCartProductQuantity))

module.exports = router