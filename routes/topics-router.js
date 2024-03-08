const express = require("express");
const topicRouter = require('express').Router()
const { getTopics, postTopic } = require('../controllers/topics.controller')

topicRouter.use(express.json())

topicRouter.get('/', getTopics)
topicRouter.post('/', postTopic)

module.exports = topicRouter

