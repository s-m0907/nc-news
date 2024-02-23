const { removeComment } = require("../models/comments.models")

exports.deleteComment = (req, res, next) => {
    const comment = req.params.comment_id
    removeComment(comment).then(() => {
        res.status(204).send()
    })
    .catch(next)
  }