const express = require("express");
const { getTopics, getEndpoints, getArticleById, getArticles, getCommentsByArticleId } = require("./controller.js");
const { handleCustomErrors, handlePsqlErrors, handleServerErrors, handleInvalidEndpoint } = require("./errors.controller.js")
const app = express();

app.get('/api/topics', getTopics)

app.get('/api', getEndpoints)

app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id/comments', getCommentsByArticleId)

app.all("/*", handleInvalidEndpoint)

app.use(handleCustomErrors)

app.use(handlePsqlErrors)

app.use(handleServerErrors)

module.exports = app