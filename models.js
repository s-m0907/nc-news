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

exports.selectArticles = (topic) => {
  const validTopics = ['mitch', 'cats', 'paper']
  if(!validTopics.includes(topic)) {
    return Promise.reject({status: 400, msg: 'Bad request'})
  }
  const queryValues = []
  let queryString = `SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id) AS comment_count
  FROM articles FULL JOIN comments ON articles.article_id = comments.article_id`

  if(topic) {
    queryString += ` WHERE topic = $1`
    queryValues.push(topic)
  }

  queryString += `
  GROUP BY articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url
  ORDER BY created_at DESC`;

  return db.query(queryString, queryValues).then((result) => {
    return result.rows;
  });
};

exports.selectCommentsByArticle = (article) => {
  let queryString = `SELECT * FROM comments`;
  const queryValues = [];
    queryValues.push(article);
    queryString += ` WHERE article_id = $1 ORDER BY created_at DESC`;

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
  return db.query(`SELECT * FROM articles WHERE article_id = $1`, [article])
  .then((result) => {
    if(!result.rows[0]) {
      return Promise.reject({
        status: 404,
        msg: `Article not found`
      })
    }
  }).then(() => {
  return db.query(`UPDATE articles SET votes = votes + $1 WHERE article_id = $2 AND votes + $1 >= 0 RETURNING *`, [votes, article])
  .then((result) => {
      if(!result.rows[0]) {
        return Promise.reject({
          status: 400,
          msg: `Bad request`,
        });
      }
    return result.rows[0]
  })
})
}

exports.removeComment = (comment) => {
  return db
  .query("SELECT * FROM comments WHERE comment_id = $1;", [comment])
  .then((result) => {
    if (!result.rows[0]) {
      return Promise.reject({
        status: 404,
        msg: `Comment not found`,
      });
    }
  return db.query(`DELETE FROM comments WHERE comment_id = $1`, [comment])
})
}

