const db = require('./db/connection.js')
const fs = require('fs/promises')

exports.selectTopics = () => {
    return db.query(`SELECT * FROM topics`).then((result) => {
        return result.rows;
})
}

exports.readEndpoints = () => {
    return fs.readFile('endpoints.json').then((endpoints) => {
        return JSON.parse(endpoints)
})
}

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