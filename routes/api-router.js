const apiRouter = require('express').Router()
const articleRouter = require('./articles-router');
const commentRouter = require('./comments-router');
const topicRouter = require('./topics-router');
const userRouter = require('./users-router')

apiRouter.use('/articles', articleRouter);
apiRouter.use('/comments', commentRouter)
apiRouter.use('/topics', topicRouter)
apiRouter.use('/users', userRouter)

module.exports = apiRouter