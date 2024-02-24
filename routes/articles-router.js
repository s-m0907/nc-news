const express = require("express");
const articleRouter = require('express').Router()
const { getArticleById, getArticles, getCommentsByArticleId, postComment, patchVotes, postArticle} = require("../controllers/articles.controller.js");

articleRouter.use(express.json())

articleRouter.route('/:article_id')
.get(getArticleById)
.patch(patchVotes)

articleRouter.route('/')
.get(getArticles)
.post(postArticle)

articleRouter.route('/:article_id/comments')
.get(getCommentsByArticleId)
.post(postComment)

module.exports = articleRouter;