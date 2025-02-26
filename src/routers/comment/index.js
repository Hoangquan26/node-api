'use strict'

const express = require('express')
const CommentController = require('../../controllers/comment.controller')
const asyncHandle = require('../../helpers/asyncHandle')
const router = express.Router()

router.post('/', asyncHandle(CommentController.createComment))
router.delete('/', asyncHandle(CommentController.deleteComment))
router.get('/:productId', asyncHandle(CommentController.getCommentByParentId))
module.exports = router