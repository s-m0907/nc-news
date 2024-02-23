const { readEndpoints, selectArticle, selectArticles, selectCommentsByArticle, insertComment, updateVotes } = require('../models/articles.models')

exports.getEndpoints = (req, res, next) => {
    readEndpoints().then((endpoints) => {
        res.status(200).send({ endpoints })
    })
    .catch(next)
}

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params
    selectArticle(article_id).then((article) => {
        res.status(200).send({ article })
    })
    .catch(next)
}

exports.getArticles = (req, res, next) => {
    const { topic, sort_by, order } = req.query
    selectArticles(topic, sort_by, order).then((articles) => {
        res.status(200).send({ articles })
    })
    .catch(next)
} 

exports.getCommentsByArticleId = (req, res, next) => {
    const article = req.params.article_id
 selectCommentsByArticle(article).then((comments) => {
    res.status(200).send({ comments })
 })
 .catch(next)
}

exports.postComment = (req, res, next) => {
    const newComment = req.body;
    const article = req.params.article_id
    insertComment(newComment, article).then((comment) => {
        res.status(201).send({ comment });
    })
    .catch(next)
  };

  exports.patchVotes = (req, res, next) => {
    const newVotes = req.body.inc_votes
    const article_id = req.params.article_id
    updateVotes(newVotes, article_id).then((article) => {
        res.status(200).send({ article })
    })
    .catch(next)
  }


  