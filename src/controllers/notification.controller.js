'use strict'

const { CREATED, OK } = require("../core/success.response")
const { listNotifyUser } = require("../services/notification.service")

class NotificationController {
    static listNotifyUser = async(req, res, next) => {
        console.log(req.params)
        new OK({
            message: "list notify success",
            metadata: await listNotifyUser({
                ...req.params,
                userId: req.user.userId
            })
        }).send(res)
    }
}

module.exports = NotificationController