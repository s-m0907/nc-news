const { readEndpoints, selectArticle, selectArticles, selectCommentsByArticle, insertComment, updateVotes, insertArticle, removeArticle, deleteComments } = require('../models/articles.models')
const { selectTopics } = require('../models/topics.models')

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
    selectTopics()
        .then((topics) => {
            const validTopics = topics.map((topic) => topic.slug);
            const { topic, sort_by, order, limit, p } = req.query;
            return selectArticles(validTopics, topic, sort_by, order, limit, p);
        })
        .then((articles) => {
            res.status(200).send({ articles });
        })
        .catch(next) ;
};


exports.getCommentsByArticleId = (req, res, next) => {
    const { article_id } = req.params
    const { limit, p } = req.query
 selectCommentsByArticle(article_id, limit, p).then((comments) => {
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

  exports.postArticle = (req, res, next) => {
    const { author, title, body, topic, article_img_url } = req.body
    insertArticle(author, title, body, topic, article_img_url).then((article_id) => {
        selectArticle(article_id).then((article) => {
            res.status(201).send( { article })
        })
    })
    .catch(next)
  }

  exports.deleteArticle = (req, res, next) => {
    const { article_id } = req.params
    deleteComments(article_id).catch(next)
    removeArticle(article_id).then(() => {
        res.status(204).send()
    })
    .catch(next)
    }


  