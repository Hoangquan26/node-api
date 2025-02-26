'use strict'

const { CREATED, OK } = require("../core/success.response")
const CommentService = require("../services/comment.service")

class CommentController {
    static createComment = async(req, res, next) => {
        new CREATED({
            message: "Create comment successful",
            metadata: await CommentService.createComment({
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    }

    static deleteComment = async(req, res, next) => {
        new CREATED({
            message: "Create comment successful",
            metadata: await CommentService.deleteComment({
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    }

    static getCommentByParentId = async(req, res, next) => {
        new OK({
            message: "Get comment successful",
            metadata: await CommentService.getCommentByParentId({
                ...req.query,
                productId: req.params.productId
            })
        }).send(res)
    }


}

module.exports = CommentController