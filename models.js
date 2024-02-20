const db = require("./db/connection.js");
const fs = require("fs/promises");
const { convertTimestampToDate, createRef } = require('./db/seeds/utils')

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

exports.selectArticles = (sort_by = "created_at", order = "desc"
) => {
  if (!["author", "title", "article_id", "topic", "created_at", "votes", "article_img_url"].includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort query" });
  }
  if (!["asc", "desc"].includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }

  let queryString = `SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id) AS comment_count
  FROM articles
  FULL JOIN comments ON articles.article_id = comments.article_id
  GROUP BY articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url`

  if(sort_by) {
    queryString += ` ORDER BY ${sort_by} ${order}`;
  }

  return db.query(queryString).then((result) => {
    return result.rows
  });
};

