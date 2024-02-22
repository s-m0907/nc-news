const { selectUsers } = require('./users.models.js')

exports.getUsers = (req, res, next) => {
selectUsers().then((users) => {
        res.status(200).send({ users })  
    })
}