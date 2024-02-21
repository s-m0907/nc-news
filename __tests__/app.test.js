const db = require("../db/connection.js");
const app = require("../app.js");
const seed = require("../db/seeds/seed.js");
const sorted = require("jest-sorted");
const data = require("../db/data/test-data/index.js");
const request = require("supertest");

beforeEach(() => seed(data));

afterAll(() => db.end());

describe("404 Invalid Endpoint", () => {
  test("GET:404 responds with status code and error message when passed an invalid endpoint", () => {
    return request(app)
      .get("/api/not-a-route")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not found");
      });
  });
});

describe("/api/topics", () => {
  test("GET:200 responds with an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const topics = response.body.topics;
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
      });
  });
});

describe("/api", () => {
  test("GET:200 responds with an object describing all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        expect(typeof response.body).toBe("object");
        expect(response.body).toHaveProperty("endpoints");
      });
  });
});

describe("/api/articles/:article_id", () => {
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
        expect(response.body.msg).toBe("Article does not exist");
      });
  });
  test("GET:400 responds with appropriate status code and message when passed an invalid id", () => {
    return request(app)
      .get("/api/articles/four")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test('PATCH:200 patches positive vote value to specific article and responds with the updated article', () => {
    const newVote = {inc_votes : 1}
    return request(app)
    .patch("/api/articles/1")
    .send(newVote)
    .expect(200)
    .then((response) => {
      const article = response.body.article
      expect(article.article_id).toBe(1)
      expect(article.votes).toBe(101)
    })
  });
  test('PATCH:200 patches negative vote value to specific article and responds with the updated article', () => {
    const newVote = {inc_votes : -100}
    return request(app)
    .patch("/api/articles/1")
    .send(newVote)
    .expect(200)
    .then((response) => {
      const article = response.body.article
      expect(article.article_id).toBe(1)
      expect(article.votes).toBe(0)
    })
  });
  test('PATCH:404 responds with appropriate status code and error message when article_id is valid but does not exist', () => {
    const newVote = {inc_votes: 1}
    return request(app)
    .patch("/api/articles/999")
    .send(newVote)
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe('Article not found')
    })
  });
  test('PATCH:400 responds with appropriate status code and error message when article_id is invalid', () => {
    const newVote = {inc_votes: 1}
    return request(app)
    .patch("/api/articles/four")
    .send(newVote)
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request')
    })
  });
  test('PATCH:400 responds with appropriate status code and message when vote decrement is more than existing votes', () => {
    const newVote = {inc_votes : - 200}
    return request(app)
    .patch("/api/articles/1")
    .send(newVote)
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request')
    })
  })
  test('PATCH:400 responds with appropriate status code and error message when provided with an invalid newVote object', () => {
    const newVote = {inc_votes: 'one'}
    return request(app)
    .patch("/api/articles/1")
    .send(newVote)
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request')
    })
  });
});

describe("/api/articles", () => {
  test("GET:200 responds with an array of all article objects with correct properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        articles.forEach((article) => {
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).not.toHaveProperty("body");
          expect(article).toHaveProperty("comment_count");
        });
      });
  });
  test("GET:200 article array is sorted by date descending as a default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
});

describe("/api/articles/:article_id/comments", () => {
  test("GET:200 responds with an array of comments with correct properties for the given article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        const comments = response.body.comments;
        comments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id");
          expect(comment).toHaveProperty("votes");
          expect(comment).toHaveProperty("created_at");
          expect(comment).toHaveProperty("author");
          expect(comment).toHaveProperty("body");
          expect(comment.article_id).toBe(1);
        });
        expect(comments.length).toBe(11);
        expect(comments[0].body).toBe("I hate streaming noses");
        expect(comments[0].author).toBe("icellusedkars");
      });
  });
  test("GET:200 responds an array of comments sorted by most recent comment", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        const comments = response.body.comments;
        expect(comments).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("GET:404 responds with appropriate status code and message when passed an valid but nonexistant id", () => {
    return request(app)
      .get("/api/articles/999/comments")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Article does not exist");
      });
  });
  test("GET:400 responds with appropriate status code and message when passed an invalid id", () => {
    return request(app)
      .get("/api/articles/twenty/comments")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test("POST:201 posts a new comment for a specific article and returns that comment", () => {
    const newComment = {
      username: "icellusedkars",
      body: "my two cents",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then((response) => {
        const comment = response.body.comment;
        expect(comment.author).toBe("icellusedkars");
        expect(comment.body).toBe("my two cents");
        expect(comment.article_id).toBe(1);
      });
  });
  test("POST:400 responds with an appropriate status and error message when provided with an invalid comment (empty body)", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "icellusedkars",
        body: "",
      })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid comment format");
      });
  });
  test("POST:400 responds with an appropriate status and error message when provided with an invalid comment (no username)", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        body: "a comment",
      })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid comment format");
      });
  });
});