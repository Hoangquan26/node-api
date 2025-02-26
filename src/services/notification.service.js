'use strict'

const notificationModel = require("../models/notification.model")
const { convertObjectIdMongoDB } = require("../utils")

const pushNotifiToSystem = async({
    noti_type= 'SHOP_001',
    receivedId,
    senderId,
    noti_options= {}
}) => {
    let noti_content = ''
    if(noti_type === 'SHOP_001') {
        noti_content = 'Vừa thêm sản phẩm mới'
    }
    else if (noti_type === 'SHOP_002') {
        noti_content = 'Thêm sản phẩm mới không thành công'
    }
    const newNotification = await notificationModel.create({
        noti_type,
        noti_received: receivedId,
        noti_sender: senderId,
        noti_options,
        noti_content
    })
    return newNotification
}

const listNotifyUser = async({
    userId,
    noti_type = 'ALL',
    isRead = 0
}) => {
    const match = { noti_received: convertObjectIdMongoDB(userId) }
    if(noti_type !== 'ALL') 
        match['noti_type'] = noti_type

    console.log(noti_type)
    return await notificationModel.aggregate([
        {
            $match: match
        }, 
        {
            $project: {
                noti_content: 1,
                noti_received: 1,
                noti_sender: 1,
                noti_type: 1,
                noti_options:1,
                createdAt: 1
            }
        }
        // {
        //     $project: {
        //         noti_received: 1,
        //         noti_sender: 1,
        //         noti_content: 1,
        //         noti_options: 1,
        //         createdAt: 1
        //     }
        // }
    ])
}

module.exports = {
    pushNotifiToSystem,
    listNotifyUser
}