'use strict'

const { BadRequestError } = require("../core/error.response")
const commentModel = require("../models/comment.model")
const { getComments } = require("../models/repositories/comment.repo")
const { findOneProduct } = require("../models/repositories/repo.product")
const { convertObjectIdMongoDB } = require("../utils")


/*
1.add a comment [USER|SHOP]
2.delete comment [USER|SHOP]
3.get list of comment [USER|SHOP|ADMIN]
*/
class CommentService {
    static createComment = async({content, userId, productId, parentCommentId = null}) => {

        const newComment = await commentModel.create({
            comment_content: content,
            comment_userId: userId,
            comment_productId: productId,
            comment_parentId: parentCommentId
        })
        if(!newComment) throw new BadRequestError('Create comment error')

        let rightNode = 1
        if(parentCommentId) {
            const parentComment = await commentModel.findById(parentCommentId)
            if(!parentComment || parentComment.isDeleted) throw new BadRequestError('Parent comment not found')
            rightNode = parentComment.comment_rightNode
            await commentModel.updateMany({
                comment_productId: productId,
                comment_rightNode: {$gte: rightNode},
                isDeleted: false
            }, {
                $inc: {
                    comment_rightNode: 2,
                }
            })

            await commentModel.updateMany({
                comment_productId: productId,
                comment_leftNode: {$gt: rightNode},
                isDeleted: false
            }, {
                $inc: {
                    comment_leftNode: 2,
                }
            })
        }
        else {
            const foundComment = await commentModel.findOne({
                comment_productId: productId,
                isDeleted: false
            }).select('comment_rightNode').sort({comment_rightNode: -1}).lean()
            if(foundComment) {
                rightNode = foundComment.comment_rightNode + 1
            }
        }

        newComment.comment_leftNode = rightNode
        newComment.comment_rightNode = rightNode + 1
        return await newComment.save()
    }

    static getCommentByParentId = async({productId, parentCommentId = null, limit = 50, offset = 0}) => {
        const query = {
            comment_productId: convertObjectIdMongoDB(productId),
            isDeleted: false
        }
        if(parentCommentId) {
            const parentComment = await commentModel.findById(parentCommentId)
            if(!parentComment) throw new BadRequestError('Not found parent comment')
            query['comment_leftNode'] = {$gt: parentComment.comment_leftNode}
            query['comment_rightNode'] = {$lt: parentComment.comment_rightNode}
        }
        else {
            query['comment_parentId'] = parentCommentId
        }

        return await getComments({query, limit, offset})
    }


    static deleteComment = async({ productId, commentId, userId }) => {
        const foundProduct = await findOneProduct({product_id: productId, unSelect: []})
        if(!foundProduct) throw new BadRequestError('Product not found')

        const foundComment = await commentModel.findById(commentId)
        if(!foundComment) throw new BadRequestError('Product not found')

        console.log(`userId: ${userId}\n userId2: ${foundComment.comment_userId}`)
        if(userId !== foundComment.comment_userId.toString()) throw new BadRequestError('Something wrong')

        const leftNode = foundComment.comment_leftNode
        const rightNode = foundComment.comment_rightNode

        const width = rightNode - leftNode + 1

        const deleteRes = await commentModel.updateMany({
            comment_productId: convertObjectIdMongoDB(productId),
            comment_leftNode : { $gte: leftNode, $lte: rightNode}
        }, {
           isDeleted: true,
           comment_leftNode: -1,
           comment_rightNode: -1
        })

        await commentModel.updateMany({
            comment_productId: productId,
            comment_rightNode : { $gt: rightNode }
        }, {
            $inc: {
                comment_rightNode: -width
            }
        })

        await commentModel.updateMany({
            comment_productId: productId,
            comment_leftNode : { $gt: rightNode }
        }, {
            $inc: {
                comment_leftNode: -width
            }
        })

        return deleteRes 
    }
}

module.exports = CommentService