const express = require('express')
const commentRouter = require('express').Router()
const { deleteComment, patchVotes } = require('../controllers/comments.controller')

commentRouter.use(express.json())

commentRouter.route('/:comment_id')
.delete(deleteComment)
.patch(patchVotes)

module.exports = commentRouter