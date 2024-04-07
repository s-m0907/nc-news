const db = require("../db/connection.js");

exports.selectTopics = () => {
    return db.query(`SELECT * FROM topics`).then((result) => {
      return result.rows;
    });
  };

  exports.insertTopic = (slug, description) => {
    const queryValues = [slug, description]
    if(!slug || !description) {
      return Promise.reject({status: 400, msg: 'Invalid Topic Object'})
    }  
    return db.query(`INSERT INTO topics (slug, description) VALUES ($1, $2) RETURNING *`, queryValues)
    .then((result) => {
      return result.rows[0]
    })
  }