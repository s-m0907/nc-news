const db = require("./db/connection.js");
const fs = require("fs/promises");

exports.selectTopics = () => {
  return db.query(`SELECT * FROM topics`).then((result) => {
    return result.rows;
  });
};

exports.readEndpoints = () => {
  return fs.readFile("endpoints.json").then((endpoints) => {
    return JSON.parse(endpoints);
  });
};

exports.selectArticle = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [article_id])
    .then((result) => {
      if (!result.rows[0]) {
        return Promise.reject({
          status: 404,
          msg: `Article does not exist`,
        });
      }
      return result.rows[0];
    });
};

exports.selectArticles = () => {
  let queryString = `SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id) AS comment_count
  FROM articles
  FULL JOIN comments ON articles.article_id = comments.article_id
  GROUP BY articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url
  ORDER BY created_at DESC`;

  return db.query(queryString).then((result) => {
    return result.rows;
  });
};

exports.selectCommentsByArticle = (article) => {
  let queryString = `SELECT * FROM comments`;
  const queryValues = [];

  if (article) {
    queryValues.push(article);
    queryString += ` WHERE article_id = $1 ORDER BY created_at DESC`;
  }

  return db.query(queryString, queryValues).then((result) => {
    if (!result.rows[0]) {
      return Promise.reject({
        status: 404,
        msg: `Article does not exist`,
      });
    }
    return result.rows;
  });
};
