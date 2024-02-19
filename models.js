const db = require('./db/connection.js')
const fs = require('fs/promises')

exports.selectTopics = () => {
    return db.query(`SELECT * FROM topics`).then((result) => {
        return result.rows;
})
}

exports.readEndpoints = () => {
    return fs.readFile('endpoints.json').then((endpoints) => {
        console.log(JSON.parse(endpoints))
        return JSON.parse(endpoints)
})
}