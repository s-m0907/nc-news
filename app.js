const express = require("express");
const { getTopics, getEndpoints, getArticleById, getArticles } = require("./controller");
const { handleCustomErrors, handlePsqlErrors, handleServerErrors } = require("./errors.controller.js")
const app = express();

app.use(express.json());

app.get('/api/topics', getTopics)

app.get('/api', getEndpoints)

app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles', getArticles)

app.use(handleCustomErrors)

app.use(handlePsqlErrors)

app.use(handleServerErrors)

module.exports = app