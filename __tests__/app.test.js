const app = require("../app");
const seed = require("../db/seeds/seed");
const {
  topicData,
  userData,
  articleData,
  commentData,
} = require("../db/data/test-data/index.js");
const db = require("../db/connection");
const request = require("supertest");
const endpoints = require("../endpoints.json");
require("jest-sorted");

beforeEach(() => {
  return seed({ topicData, userData, articleData, commentData });
});

afterAll(() => {
  db.end();
});

describe("GET /api", () => {
  test("200: responds with an object including details of all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(endpoints);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: sends an array of correctly formatted topics to the client", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        expect(response.body.topics.length).toBe(3);
        const topicsArray = response.body.topics;
        topicsArray.forEach((topic) => {
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: sends an article object containing details of the required article", () => {
    const expectedArticle = {
      title: "Student SUES Mitch!",
      topic: "mitch",
      author: "rogersop",
      body: "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
      created_at: "2020-05-06T01:14:00.000Z",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .get("/api/articles/4")
      .expect(200)
      .then((response) => {
        expect(response.body.article.length).toBe(1);
        expect(response.body.article[0]).toMatchObject(expectedArticle);
      });
  });
  test("404: sends an appropriate status and error message when given a valid but non-existent id", () => {
    return request(app)
      .get("/api/articles/999999")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Article does not exist");
      });
  });
  test("400: sends an appropriate status and error message when given an id of invalid data type", () => {
    return request(app)
      .get("/api/articles/twelve")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad request.");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: sends an array of correctly formatted articles to the client in descending order based on their creation date", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articlesArray = response.body.articles;
        expect(articlesArray.length).toBe(13);
        expect(articlesArray).toBeSortedBy("created_at", {
          descending: true,
          coerce: true,
        });
        articlesArray.forEach((article) => {
          expect(typeof article.title).toBe("string");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.author).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect("body" in article).toBe(false);
          expect("comment_count" in article).toBe(true);
          expect(typeof Number(article.comment_count)).toBe("number");
        });
      });
  });
});

describe("GET /api/articles: Handling Queries", () => {
  describe("Sort_by query", () =>{
    test("200: sends an array of articles, defaulting to descending order of categories decided in query", () => {
      return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then((response) => {
        const articlesArray = response.body.articles;
        expect(articlesArray).toBeSortedBy("author", {descending: true});
      });
    });
    test("400: when an invalid sort-by query is sent through, responds with an error informing user", () => {
      return request(app)
        .get("/api/articles?sort_by=article_title")
        .expect(400)
        .then((response) => {
          expect(response.body.message).toBe("Bad request.");
        });
    });
  })
  describe("Order query", ()=>{
    test("200: sends an array of articles, defaulting to sorting by the created_at date", () => {
      return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then((response) => {
        const articlesArray = response.body.articles;
        expect(articlesArray).toBeSortedBy("created_at", {coerce: true});
      });
    });
    test("200: order query is case insensitive", () => {
      return request(app)
      .get("/api/articles?order=ASC")
      .expect(200)
      .then((response) => {
        const articlesArray = response.body.articles;
        expect(articlesArray).toBeSortedBy("created_at", {coerce: true});
      });
    });
    test("400: when an invalid order query is sent through, responds with an error informing user", () => {
      return request(app)
        .get("/api/articles?order=diagonal")
        .expect(400)
        .then((response) => {
          expect(response.body.message).toBe("Bad request.");
        });
    });
  })
  describe("Topic query",() => {
    test("200: filters the articles by the topic specified in query", () => {
      return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then((response) => {
        const articlesArray = response.body.articles;
        expect(articlesArray.length).toBe(12)
        articlesArray.forEach((article)=> {
          expect(article.topic).toBe("mitch")
        })
      });
    })
    test("400: when an invalid topic query is sent through, responds with an error informing user", () => {
      return request(app)
        .get("/api/articles?topic=mitchell")
        .expect(400)
        .then((response) => {
          expect(response.body.message).toBe("Bad request.");
        });
    });
  })
  test("200: sends an array of correctly formatted articles in the order of categories decided in query", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=asc")
      .expect(200)
      .then((response) => {
        const articlesArray = response.body.articles;
        expect(articlesArray).toBeSortedBy("title");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: sends an array of comments for the given article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        const commentsArray = response.body.comments;
        expect(commentsArray.length).toBe(11);
        expect(commentsArray).toBeSortedBy("created_at", {
          descending: true,
          coerce: true,
        });
        commentsArray.forEach((comment) => {
          expect(comment).toHaveProperty("body", expect.any(String));
          expect(comment).toHaveProperty("author", expect.any(String));
          expect(comment).toHaveProperty("created_at", expect.any(String));
          expect(comment).toHaveProperty("comment_id", expect.any(Number));
          expect(comment).toHaveProperty("votes", expect.any(Number));
        });
      });
  });
  test("404: sends an appropriate status and error message when given a valid but non-existent id", () => {
    return request(app)
      .get("/api/articles/9999/comments")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe(
          "Article does not have any comments"
        );
      });
  });
  test("400: sends an appropriate status and error message when given an id of invalid data type", () => {
    return request(app)
      .get("/api/articles/thirteen/comments")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad request.");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: inserts new comment to the article comments and sends the posted comment", () => {
    const postComment = {
      body: "Milk before cereal.",
      author: "butter_bridge",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(postComment)
      .expect(201)
      .then((response) => {
        const newComment = {
          comment_id: 19,
          body: "Milk before cereal.",
          article_id: 2,
          author: "butter_bridge",
          votes: 0,
        };
        expect(response.body.comment.length).toBe(1);
        expect(response.body.comment[0]).toMatchObject(newComment);
        expect(response.body.comment[0]).toHaveProperty(
          "created_at",
          expect.any(String)
        );
      });
  });
  test("400: responds with an appropriate status and error message when provided with a bad comment (missing required elements)", () => {
    const badObject = {
      body: "Need eye drops",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(badObject)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad request.");
      });
  });
  test("404: sends an appropriate status and error message when given a valid but non-existent id", () => {
    const postComment = {
      body: "Milk before cereal.",
      author: "butter_bridge",
    };
    return request(app)
      .post("/api/articles/9999/comments")
      .send(postComment)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Article not found.");
      });
  });
  test("400: sends an appropriate status and error message when given an id of invalid data type", () => {
    const postComment = {
      body: "Milk before cereal.",
      author: "butter_bridge",
    };
    return request(app)
      .post("/api/articles/thirteen/comments")
      .send(postComment)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad request.");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("201: updates votes on a specific article based on the votes passed in", () => {
    const addVotes = { inc_votes: 63 };
    return request(app)
      .patch("/api/articles/4")
      .send(addVotes)
      .expect(200)
      .then((response) => {
        expect(response.body.updatedArticle[0]).toHaveProperty(
          "article_id",
          expect.any(Number)
        );
        expect(response.body.updatedArticle[0]).toHaveProperty(
          "votes",
          expect.any(Number)
        );
        expect(response.body.updatedArticle[0].votes).toBe(63);
      });
  });
  test("400: sends an appropriate status and error message when given an incorrect object key", () => {
    const badObject = { increase_votes: 63 };
    return request(app)
      .patch("/api/articles/4")
      .send(badObject)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad request.");
      });
  });
  test("400: sends an appropriate status and error message when given an object value of incorrect data type", () => {
    const badObject = { inc_votes: "sixty-three" };
    return request(app)
      .patch("/api/articles/4")
      .send(badObject)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad request.");
      });
  });
  test("404: sends an appropriate status and error message when given a valid but non-existent id", () => {
    const postComment = {
      body: "Milk before cereal.",
      author: "butter_bridge",
    };
    return request(app)
      .patch("/api/articles/9999")
      .send(postComment)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Article not found.");
      });
  });
  test("400: sends an appropriate status and error message when given an id of invalid data type", () => {
    const badObject = { inc_votes: 63 };
    return request(app)
      .patch("/api/articles/four")
      .send(badObject)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad request.");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: deletes comment of the given comment id, sends 'No content' to user", () => {
    return request(app)
      .delete("/api/comments/8")
      .expect(204)
      .then((response) => {
        expect(response.body).toEqual({});
      });
  });
  test("404: sends an appropriate status and error message when given a valid but non-existent id", () => {
    return request(app)
      .delete("/api/comments/999999")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Comment not found.");
      });
  });
  test("400: sends an appropriate status and error message when given an id of invalid data type", () => {
    return request(app)
      .delete("/api/comments/eight")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad request.");
      });
  });
});

describe("GET /api/users", () => {
  test("200: sends an array of correctly formatted users to the client", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        expect(response.body.users.length).toBe(4);
        const usersArray = response.body.users;
        usersArray.forEach((user) => {
          expect(user).toHaveProperty("username", expect.any(String));
          expect(user).toHaveProperty("name", expect.any(String));
          expect(user).toHaveProperty("avatar_url", expect.any(String));
        });
      });
  });
});
