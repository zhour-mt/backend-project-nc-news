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

describe("GET /api/articles/:article_id/comments", () => {
  test("200: sends an array of comments for the given article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        const commentsArray = response.body.comments;
        console.log(commentsArray);
        expect(commentsArray.length).toBe(11);
        expect(commentsArray).toBeSortedBy("created_at", {
          descending: true,
          coerce: true,
        });
        commentsArray.forEach((comment) => {
          expect(comment).toHaveProperty("body", expect.any(String));
          expect(comment).toHaveProperty("author", expect.any(String));
          expect(comment).toHaveProperty("created_at", expect.any(String));
          expect(comment).toHaveProperty("article_id", expect.any(Number));
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
