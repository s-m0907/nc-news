const express = require("express");
const { getTopics, getEndpoints, getArticleById, getArticles, getCommentsByArticleId, postComment, patchVotes, deleteComment } = require("./controller.js");
const { handleCustomErrors, handlePsqlErrors, handleServerErrors, handleInvalidEndpoint } = require("./errors.controller.js")
const app = express();

app.use(express.json())

app.get('/api/topics', getTopics)

app.get('/api', getEndpoints)

app.get('/api/articles/:article_id', getArticleById)
app.patch('/api/articles/:article_id', patchVotes)

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id/comments', getCommentsByArticleId)
app.post('/api/articles/:article_id/comments', postComment)

app.delete('/api/comments/:comment_id', deleteComment)

app.all("/*", handleInvalidEndpoint)

app.use(handleCustomErrors)

app.use(handlePsqlErrors)

app.use(handleServerErrors)

module.exports = app