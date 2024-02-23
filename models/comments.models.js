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