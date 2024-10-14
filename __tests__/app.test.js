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
    return request(app)
      .get("/api/articles/4")
      .expect(200)
      .then((response) => {
        expect(response.body.article.length).toBe(1);
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

describe("GET any incorrect endpoint", () => {
  test("when passed an incorrect endpoint, returns 404 error with error message", () => {
    return request(app)
      .get("/topics")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Path not found.");
      });
  });
});
