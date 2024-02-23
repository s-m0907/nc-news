const express = require("express");
const articleRouter = require('express').Router()
const { getArticleById, getArticles, getCommentsByArticleId, postComment, patchVotes} = require("../controllers/articles.controller.js");

articleRouter.use(express.json())

articleRouter.route('/:article_id')
.get(getArticleById)
.patch(patchVotes)

articleRouter.route('/')
.get(getArticles)

articleRouter.route('/:article_id/comments')
.get(getCommentsByArticleId)
.post(postComment)

module.exports = articleRouter;