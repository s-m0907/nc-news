const express = require("express");
const { getEndpoints } = require("./controllers/articles.controller.js");
const { handleCustomErrors, handlePsqlErrors, handleServerErrors, handleInvalidEndpoint } = require("./errors.controller.js");
const app = express();
const apiRouter = require('./routes/api-router.js');
const cors = require('cors')

app.use(cors())

app.use(express.json())

app.use('/api', apiRouter)

app.get('/api', getEndpoints)

app.all("/*", handleInvalidEndpoint)

app.use(handleCustomErrors)

app.use(handlePsqlErrors)

app.use(handleServerErrors)

module.exports = app