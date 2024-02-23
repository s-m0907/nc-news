const { removeComment, updateComment } = require("../models/comments.models")

exports.deleteComment = (req, res, next) => {
    const comment = req.params.comment_id
    removeComment(comment).then(() => {
        res.status(204).send()
    })
    .catch(next)
  }

  exports.patchVotes = (req, res, next) => {
    const { comment_id } = req.params
    const { inc_votes } = req.body
    updateComment(comment_id, inc_votes).then((comment) => {
        res.status(201).send({ comment })
    })
    .catch(next)
  }