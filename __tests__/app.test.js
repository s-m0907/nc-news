const db = require('../db/connection.js')
const app = require('../app.js')
const seed = require('../db/seeds/seed.js')
const { topicData, userData, articleData, commentData } = require("../db/data/test-data/index.js")
const request = require('supertest')

beforeEach(() => seed({topicData, userData, articleData, commentData}))

afterAll(() => db.end())

describe('ERRORS: general handling', () => {
    test('GET:404 responds when endpoint is not a route', () => {
        return request(app).get('/api/not-a-route')
        .expect(404)
    });
});

describe('CORE: GET /api/topics', () => {
    test('GET:200 responds with an array of topic objects', () => {
        return request(app).get('/api/topics')
        .expect(200)
        .then((response) => {
            const topics = response.body.topics
            topics.forEach((topic) => {
                expect(topic).toHaveProperty('slug')
                expect(topic).toHaveProperty('description')
            })
        })
    });
    test('GET:404 responds when endpoint not a route', () => {
        return request(app).get('/api/topics/not-a-route')
        .expect(404)
        })    
        });