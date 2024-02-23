const userRouter = require('express').Router()
const { getUsers, getUser } = require("../controllers/users.controller.js");

userRouter.get('/', getUsers)
userRouter.get('/:username', getUser)

module.exports = userRouter