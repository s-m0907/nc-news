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
  test('POST:201 ignores unnecessary properties on the request object', () => {
    const newComment = {
      username: "icellusedkars",
      body: "my two cents",
      extra_property: "to be ignored"
    };
    return request(app)
    .post('/api/articles/1/comments')
    .send(newComment)
    .expect(201)
    .then((response) => {
      const comment = response.body.comment
      expect(comment).not.toHaveProperty('extra_property')
      
    })
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
  test('POST:404 responds with an appropriate status and error message for valid but non-existent article_id', () => {
    return request(app)
    .post('/api/articles/999/comments')
    .send({
      username: "icellusedkars",
      body: "a comment",
    })
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe("Not found")
    })
  });
  test('POST:400 responds with appropriate status and error for an invalid article id', () => {
    return request(app)
    .post('/api/articles/four/comments')
    .send({
      username: "icellusedkars",
      body: "a comment",
    })
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request')
    })
  })
  test('POST:404 responds with appropriate status and error message for valid but non-existent username', () => {
    return request(app)
    .post('/api/articles/1/comments')
    .send({
      username: "not-a-user",
      body: "a comment",
    })
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe('Not found')
    })
  })
});

describe('/api/comments/:comment_id', () => {
  test('DELETE:204 deletes comment by comment id and responds with 204 no content ', () => {
    return request(app)
    .delete('/api/comments/1')
    .expect(204)
  });
  test('DELETE:404 responds with status and message for valid non-existent comment_id', () => {
    return request(app)
    .delete('/api/comments/999')
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe('Comment not found')
    })
  });
  test('DELETE:400 responds with status and message for invalid comment_id', () => {
    return request(app)
    .delete('/api/comments/four')
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request')
    })
  });
});

describe("/api/users", () => {
  test("GET:200 responds with an array of user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        const users = response.body.users;
        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(user).toHaveProperty("username");
          expect(user).toHaveProperty("name");
          expect(user).toHaveProperty("avatar_url");
        });
      });
  });
});

describe("/api/articles?topic", () => {
  test('GET:200 accepts a topic query and responds with an array of articles filtered by topic', () => {
    return request(app)
    .get("/api/articles?topic=cats")
    .expect(200)
    .then((response) => {
      const articles = response.body.articles
      expect(articles.length).toBe(1)
      articles.forEach((article) => {
        expect(article.topic).toBe('cats')
      })
    })
  });
  test('GET:200 should respond with an empty array when filtering by a topic with no articles', () => {
    return request(app)
    .get('/api/articles?topic=paper')
    .expect(200)
    .then((response) => {
      const articles = response.body.articles
      expect(articles.length).toBe(0)
    })
  });
  test('GET:404 responds with status and error message when query topic does not exist', () => {
    return request(app)
    .get('/api/articles?topic=food')
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe('Topic not found')
    })
  });
})

describe("FEATURE REQUEST /api/article/:article_id comment count", () => {
  test('GET:200 responds with a specific article object with added property comment_count', () => {
    return request(app)
    .get('/api/articles/1')
    .expect(200)
    .then((response) => {
      const article = response.body.article
      expect(article.comment_count).toBe(11)
      expect(article.article_id).toBe(1)
    })
  });
})

describe('FEATURE REQUEST /api/articles sort and order queries', () => {
  test('GET:200 responds with an array of article sorted by a valid column with default order desc', () => {
    return request(app)
    .get('/api/articles?sort_by=votes')
    .expect(200)
    .then((response) => {
      const articles = response.body.articles
      expect(articles).toBeSortedBy('votes', {descending: true})
    })
  });
  test('GET:400 responds with status code and message when given an invalid sort_by', () => {
    return request(app)
    .get('/api/articles?sort_by=invalid')
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Invalid sort query')
    })
  });
  test('GET:200 responds with array of articles wirh valid order query and default sortby', () => {
    return request(app)
    .get('/api/articles?order=asc')
    .expect(200)
    .then((response) => {
      const articles = response.body.articles
      expect(articles).toBeSortedBy('created_at', {ascending: true})
    })
  });
  test('GET:400 responds with status code and err message when given an invalid order query', () => {
    return request(app)
    .get('/api/articles?order=alphabetical')
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Invalid order query')
    })
  });
  test('GET:200 responds with array of articles sorted and ordered by given query', () => {
    return request(app)
    .get('/api/articles?sort_by=votes&order=asc')
    .expect(200)
    .then((response) => {
      const articles = response.body.articles
      expect(articles).toBeSortedBy('votes', {ascending: true})
    })
  })
});

describe('/api/users/:username', () => {
  test('GET:200 responds with a user object by username', () => {
    return request(app)
    .get('/api/users/butter_bridge')
    .expect(200)
    .then((response) => {
      const user = response.body.user
      expect(user.username).toBe('butter_bridge')
      expect(user.avatar_url).toBe('https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg')
      expect(user.name).toBe('jonny')
    })
  });
  test('GET:404 responds with status code and err message when username is valid but does not exist', () => {
    return request(app)
    .get('/api/users/not_a_user')
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe('User not found')
    })
  });
});

describe('/api/comments/:comment_id', () => {
  test('PATCH:201 request body accepts a vote increment object and responds with the updated comment', () => {
    const newVotes = { inc_votes : 1 }
    return request(app)
    .patch('/api/comments/1')
    .send(newVotes)
    .expect(201)
    .then((response) => {
      const comment = response.body.comment
      expect(comment.votes).toBe(17)
      expect(comment.comment_id).toBe(1)
    })
  });
  test('PATCH:201 ignores unnecessary properties on request body', () => {
    const newVotes = {inc_votes: 1, extra_property: 'ignore_me'}
    return request(app)
    .patch('/api/comments/1')
    .send(newVotes)
    .expect(201)
    .then((response) => {
      const comment = response.body.comment
      expect(comment.votes).toBe(17)
      expect(comment.comment_id).toBe(1)
    })
  });
  test('PATCH:400 responds with status and error message when provided with invalid comment_id', () => {
    const newVotes = {inc_votes: 1}
    return request(app)
    .patch('/api/comments/four')
    .send(newVotes)
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request')
    })
  });
  test('PATCH:404 responds with status and error message when provided with valid bu non existent comment id', () => {
    const newVotes = {inc_votes: 1}
    return request(app)
    .patch('/api/comments/999')
    .send(newVotes)
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe('Comment not found')
    })
  });
  test('PATCH:400 responds with status and error message when vote_inc value is invalid', () => {
    const newVotes = {inc_votes: 'two'}
    return request(app)
    .patch('/api/comments/1')
    .send(newVotes)
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request')
    })
  });
});

describe('/api/articles', () => {
  test('POST:201 posts a new article from request body and returns that article', () => {
    const newArticle = {
      author: "rogersop",
      title: "new article",
      body: "Hyperparameter tuning bias conditional probability reinforcement learning categorical data expert system k-fold cross validation feature extraction overfitting precision objective function. K-nearest neighbors markov chain algorithm parameter scikit-learn logistic regression stochastic.",
      topic: "paper",
      article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
    }
    return request(app)
    .post('/api/articles')
    .send(newArticle)
    .expect(201)
    .then((response) => {
      const article = response.body.article
      expect(article.author).toBe('rogersop')
      expect(article).toHaveProperty('article_id')
      expect(article).toHaveProperty('created_at')
      expect(article).toHaveProperty('votes')
      expect(article.body).toBe('Hyperparameter tuning bias conditional probability reinforcement learning categorical data expert system k-fold cross validation feature extraction overfitting precision objective function. K-nearest neighbors markov chain algorithm parameter scikit-learn logistic regression stochastic.')
      expect(article.title).toBe('new article')
      expect(article.topic).toBe('paper')
      expect(article).toHaveProperty('comment_count')
      expect(article).toHaveProperty('article_img_url')
    })
  });
  test('POST:201 ignores unnecessary properties on request body', () => {
    const newArticle = {
      author: "rogersop",
      title: "new article",
      body: "Hyperparameter tuning bias conditional probability reinforcement learning categorical data expert system k-fold cross validation feature extraction overfitting precision objective function. K-nearest neighbors markov chain algorithm parameter scikit-learn logistic regression stochastic.",
      topic: "paper",
      article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      extra_property: 'ignore_me'
    }
    return request(app)
    .post('/api/articles')
    .send(newArticle)
    .expect(201)
    .then((response) => {
      const article = response.body.article
      expect(article).not.toHaveProperty('extra_property')
    })
  });
  test('POST:201 inserts default articles img url if no url provided', () => {
    const newArticle = {
        author: "rogersop",
        title: "new article",
        body: "Hyperparameter tuning bias conditional probability reinforcement learning categorical data expert system k-fold cross validation feature extraction overfitting precision objective function. K-nearest neighbors markov chain algorithm parameter scikit-learn logistic regression stochastic.",
        topic: "paper",
    }
    return request(app)
    .post('/api/articles')
    .send(newArticle)
    .expect(201)
    .then((response) => {
      const article = response.body.article
      expect(article.article_img_url).toBe('https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700')
  })
})
test('POST:400 responds with status code and error when sent an invalid article object', () => {
  const invalidArticle = {
    a_property: 'a string'
}
return request(app)
.post('/api/articles')
.send(invalidArticle)
.expect(400)
.then((response) => {
  expect(response.body.msg).toBe('Bad request')
})
})
test('POST:404 reponds with status code and error when user does not exist', () => {
  const newArticle = {
    author: "not_a_user",
    title: "new article",
    body: "Hyperparameter tuning bias conditional probability reinforcement learning categorical data expert system k-fold cross validation feature extraction overfitting precision objective function. K-nearest neighbors markov chain algorithm parameter scikit-learn logistic regression stochastic.",
    topic: "paper",
}
return request(app)
.post('/api/articles')
.send(newArticle)
.expect(404)
.then((response) => {
  expect(response.body.msg).toBe('Not found')
})
})
test('POST:404 reponds with status code and error when topic does not exist', () => {
  const newArticle = {
    author: "rogersop",
    title: "new article",
    body: "Hyperparameter tuning bias conditional probability reinforcement learning categorical data expert system k-fold cross validation feature extraction overfitting precision objective function. K-nearest neighbors markov chain algorithm parameter scikit-learn logistic regression stochastic.",
    topic: "not_a_topic",
}
return request(app)
.post('/api/articles')
.send(newArticle)
.expect(404)
.then((response) => {
  expect(response.body.msg).toBe('Not found')
})
})
})
