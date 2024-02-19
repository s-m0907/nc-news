const db = require("../db/connection.js");
const app = require("../app.js");
const seed = require("../db/seeds/seed.js");
const {
  topicData,
  userData,
  articleData,
  commentData,
} = require("../db/data/test-data/index.js");
const request = require("supertest");

beforeEach(() => seed({ topicData, userData, articleData, commentData }));

afterAll(() => db.end());

describe("CORE: GET /api/topics", () => {
  test("GET:200 responds with an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const topics = response.body.topics;
        expect(topics.length).toBe(3)
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
      });
  });
});

describe("CORE: GET /api", () => {
  test("GET:200 responds with an object describing all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        expect(typeof response).toBe("object");
      });
  });
});

describe("CORE: GET /api/articles/:article_id", () => {
    test("GET:200 responds with the article object for the given id", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then((response) => {
          const article = response.body.article;
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("body");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("article_img_url");
        });
    });
    test("GET:404 responds with appropriate status code and message when passed an valid but nonexistant id", () => {
      return request(app)
        .get("/api/articles/999")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe('Article does not exist');
        });
    });
    test('GET:400 responds with appropriate status code and message when passed an invalid id', () => {
      return request(app)
      .get("/api/articles/four")
      .expect(400)
      .then((response) => {
          expect(response.body.msg).toBe('Bad request')
      })
    });
  });