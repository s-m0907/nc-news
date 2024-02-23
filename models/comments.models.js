const db = require("../db/connection.js");

exports.removeComment = (comment) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *`, [comment])
    .then((result) => {
      if (!result.rows[0]) {
        return Promise.reject({
          status: 404,
          msg: `Comment not found`,
        });
      }
    });
};

exports.updateComment = (comment, votes) => {
  return db
    .query(`SELECT * FROM comments WHERE comment_id = $1`, [comment])
    .then((result) => {
      if (!result.rows[0]) {
        return Promise.reject({
          status: 404,
          msg: `Comment not found`,
        });
      }
    })
    .then(() => {
      return db.query(
        `UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *`,
        [votes, comment]
      );
    })
    .then((result) => {
      if (!result.rows[0]) {
        return Promise.reject({
          status: 400,
          msg: `Bad request`,
        });
      }
      return result.rows[0];
    });
};
