const { selectTopics, readEndpoints, selectArticle, selectArticles } = require('./models')

exports.getTopics = (req, res, next) => {
    selectTopics().then((topics) => {
        res.status(200).send({ topics })  
    })
    .catch(next)
}

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
    const { sort_by, order } = req.query
    selectArticles(sort_by, order).then((articles) => {
        console.log({articles})
        res.status(200).send({ articles })
    })
    .catch(next)
}