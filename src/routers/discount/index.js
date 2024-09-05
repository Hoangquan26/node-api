'use strict'

const express = require('express')
const router = express.Router();

const DiscountController = require('../../controllers/discount.controller')
const { authenticationV2 } = require('../../auth/authUtils');
const asyncHandle = require('../../helpers/asyncHandle');

/**
 * @param discount_id
 *  */ 
router.get('/all-products', asyncHandle(DiscountController.findAllProductAvailable))
router.post('/amount', asyncHandle(DiscountController.getDiscountAmount))
router.get('/all/:discount_shopId', asyncHandle(DiscountController.getAllDiscountCodesByShop))


router.use(authenticationV2)
/**
 * @param discount_name
    @param discount_description
    @param discount_type
    @param discount_value
    @param discount_code
    @param discount_start_date
    @param discount_end_date
    @param discount_user_used
    @param discount_max_uses
    @param discount_uses_count
    @param discount_max_uses_per_user
    @param discount_min_order_value
    @param discount_shopId
    @param discount_is_active
    @param discount_applies_to
    @param discount_products_id
 * 
 */
router.post('/insert', asyncHandle(DiscountController.insertDiscount))

/**SHOP
   @param discount_shopId** (auto get from token)
   @param discount_code**

   @param discount_name
   @param discount_description
   @param discount_type
   @param discount_value
   @param discount_start_date
   @param discount_end_date
   @param discount_user_used
   @param discount_max_uses
   @param discount_uses_count
   @param discount_max_uses_per_user
   @param discount_min_order_value
   @param discount_is_active
   @param discount_applies_to
   @param discount_products_id
 * 
 */
router.patch('/update', asyncHandle(DiscountController.updateDiscount))

/** USER
 * @param discount_shopId 
 * @param discount_code
 * @param userId (auto get from token)
 */
router.post('/cancel', asyncHandle(DiscountController.cancelDiscount))

/** SHOP
 * @param discount_shopId (auto get from token)
 * @param discount_code
 */
router.post('/delete', asyncHandle(DiscountController.delecteDiscount))


module.exports = router