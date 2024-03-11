const db = require("../db/connection.js");
const fs = require("fs/promises");

exports.readEndpoints = () => {
  return fs.readFile("endpoints.json").then((endpoints) => {
    return JSON.parse(endpoints);
  });
};

exports.selectArticle = (article_id) => {
  return db
    .query(
      "SELECT articles.author, title, articles.body, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id)::INT AS comment_count FROM articles FULL JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url",
      [article_id]
    )
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

exports.selectArticles = (topics, topic, sort_by = 'created_at', order = 'desc', limit = 10, p = 1) => {
  const queryValues = [];

  let queryString = `SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id)::INT AS comment_count
  FROM articles FULL JOIN comments ON articles.article_id = comments.article_id `;

if(!['author', 'title', 'article_id', 'topic', 'created_at', 'votes', 'article_img_url'].includes(sort_by)) {
  return Promise.reject({ status: 400, msg: "Invalid sort query" })
}

if(!['asc', 'desc'].includes(order)) {
  return Promise.reject({ status: 400, msg: "Invalid order query" })
}

  if (topic) {
    if (!topics.includes(topic)) {
      return Promise.reject({ status: 404, msg: "Topic not found" });
    }
    queryString += ` WHERE topic = $1`;
    queryValues.push(topic);
  }

  const offset = (p - 1) * limit

  queryString += `
  GROUP BY articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url
  ORDER BY ${sort_by} ${order} LIMIT ${limit} OFFSET ${offset}`;

  return db.query(queryString, queryValues).then((result) => {
    return result.rows;
  });
};

exports.selectCommentsByArticle = (article, limit = 10, p = 1) => {
  let queryString = `SELECT * FROM comments`;
  const queryValues = [];
  queryValues.push(article);
  queryValues.push(limit)

  const offset = (p - 1) * limit
  queryValues.push(offset)

  queryString += ` WHERE article_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;

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

exports.insertComment = (newComment, article) => {
  const { username, body } = newComment;
  if (body.length === 0 || !username || !body) {
    return Promise.reject({
      status: 400,
      msg: `Invalid comment format`,
    });
  }
  return db
    .query(
      "INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *;",
      [username, body, article]
    )
    .then((result) => {
      return result.rows[0];
    });
};

exports.updateVotes = (votes, article) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article])
    .then((result) => {
      if (!result.rows[0]) {
        return Promise.reject({
          status: 404,
          msg: `Article not found`,
        });
      }
    })
    .then(() => {
      return db
        .query(
          `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 AND votes + $1 >= 0 RETURNING *`,
          [votes, article]
        )
        .then((result) => {
          if (!result.rows[0]) {
            return Promise.reject({
              status: 400,
              msg: `Bad request`,
            });
          }
          return result.rows[0];
        });
    });
};

exports.insertArticle = (author, title, body, topic, article_img_url="https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700") => {
if(!author || !title || !body || !topic) {
  return Promise.reject({status: 400, msg: 'Bad request'})
}  
return db.query(`INSERT INTO articles (author, title, body, topic, article_img_url) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [author, title, body, topic, article_img_url])
.then((result) => {
  return result.rows[0].article_id
})
}

exports.deleteComments = (article_id) => {
  return db.query(`DELETE FROM comments WHERE article_id = $1 RETURNING *`, [article_id])
}

exports.removeArticle = (article_id) => {
  return db.query(`DELETE FROM articles WHERE article_id = $1 RETURNING *`, [article_id])
  .then((result) => {
    if (!result.rows[0]) {
      return Promise.reject({
        status: 404,
        msg: `Not found`,
      });
    }
  });
}