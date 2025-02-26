'use strict'

class strategyNotify {
    static notifyType = {}

    static addNotifyType = (key, value) => {
        this.notifyType[key, value]
    }
}

const notifyType = {
    CREATED_ORDER: 'ORDER_001',
    FAILED_ORDER: 'ORDER_002',
    NEW_DISCOUNT: 'PROMOTION_001',
    DELETED_DISCOUNT: 'PROMOTION_002',
    NEW_PRODUCT: 'SHOP_001',
}

module.exports = {
    strategyNotify
}