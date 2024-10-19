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
const { idleTimeoutMillis } = require("pg/lib/defaults.js");
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
        const article = response.body.article;
        expect(article.length).toBe(1);
        expect(article[0]).toMatchObject(expectedArticle);
      });
  });
  test("200: the article returned must also include a comment_count feature", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        const article = response.body.article;
        expect(article.length).toBe(1);
        expect(article[0]).toHaveProperty("comment_count");
        expect(typeof Number("comment_count")).toBe("number");
      });
  });
  test("404: sends an appropriate status and error message when given a valid but non-existent id", () => {
    return request(app)
      .get("/api/articles/999999")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Article does not exist.");
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
        expect(articlesArray.length).toBe(10);
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

describe("GET /api/articles - Handling Queries", () => {
  test("200: sends an array of correctly formatted articles in the order of categories decided in query", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=asc")
      .expect(200)
      .then((response) => {
        const articlesArray = response.body.articles;
        expect(articlesArray).toBeSortedBy("title");
      });
  });
  describe("Sort_by query", () => {
    test("200: sends an array of articles, defaulting to descending order of categories decided in query", () => {
      return request(app)
        .get("/api/articles?sort_by=author")
        .expect(200)
        .then((response) => {
          const articlesArray = response.body.articles;
          expect(articlesArray).toBeSortedBy("author", { descending: true });
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
  });
  describe("Order query", () => {
    test("200: sends an array of articles, defaulting to sorting by the created_at date", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then((response) => {
          const articlesArray = response.body.articles;
          expect(articlesArray).toBeSortedBy("created_at", { coerce: true });
        });
    });
    test("200: order query is case insensitive", () => {
      return request(app)
        .get("/api/articles?order=ASC")
        .expect(200)
        .then((response) => {
          const articlesArray = response.body.articles;
          expect(articlesArray).toBeSortedBy("created_at", { coerce: true });
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
  });
  describe("Topic query", () => {
    test("200: filters the articles by the topic specified in query", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then((response) => {
          const articlesArray = response.body.articles;
          expect(articlesArray.length).toBe(10);
          articlesArray.forEach((article) => {
            expect(article.topic).toBe("mitch");
          });
        });
    });
    test("400: when an invalid topic query is sent through, responds with an error informing user", () => {
      return request(app)
        .get("/api/articles?topic=mitchell")
        .expect(400)
        .then((response) => {
          expect(response.body.message).toBe("Bad request.");
        });
    });
  });
  describe("Limit query", () => {
    test("200: sends an array of the articles decided in the limit", () => {
      return request(app)
        .get("/api/articles?limit=5&page=2")
        .expect(200)
        .then((response) => {
          const firstArticleOnPage =  {
            article_id: 5,
            author: 'rogersop',
            title: 'UNCOVERED: catspiracy to bring down democracy',
            topic: 'cats',
            created_at: '2020-08-03T13:14:00.000Z',
            votes: 0,
            article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
            comment_count: '2'
          }
          const articlesArray = response.body.articles;
          expect(articlesArray.length).toBe(5);
          expect(articlesArray[0]).toMatchObject(firstArticleOnPage)
        });
    });
    test("400: when an invalid page limit is sent through, returns error", () => {
      return request(app)
        .get("/api/articles?limit=ten")
        .expect(400)
        .then((response) => {
          expect(response.body.message).toBe("Bad request.");
        });
    });
  });
  describe("Page query", () => {
    test("200: sends an array of the articles in the selected page, defaulting to a limit of 10 articles per page", () => {
      return request(app)
        .get("/api/articles?page=1")
        .expect(200)
        .then((response) => {
          const articlesArray = response.body.articles;
          expect(articlesArray.length).toBe(10);
        });
    });
    test("404: when an non existent page query is sent through, returns error", () => {
      return request(app)
        .get("/api/articles?page=5")
        .expect(404)
        .then((response) => {
          expect(response.body.message).toBe("Article page not found.");
        });
    });
    test("400: when a page query of invalid data type is sent through, returns error", () => {
      return request(app)
        .get("/api/articles?page=four")
        .expect(400)
        .then((response) => {
          expect(response.body.message).toBe("Bad request.");
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
        expect(commentsArray.length).toBe(10);
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
          "Article does not have any comments."
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

describe("GET /api/articles/:article_id/comments - Handling Queries", () => {
  describe("Limit query", () => {
    test("200: sends an array of the articles decided in the limit", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=5&page=1")
        .expect(200)
        .then((response) => {
          const firstCommentOnPage =  {
            comment_id: 2,
            body: 'The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.',
            article_id: 1,
            author: 'butter_bridge',
            votes: 14,
            created_at: '2020-10-31T03:03:00.000Z'
          }
          const commentsArray = response.body.comments;
          expect(commentsArray.length).toBe(5);
          expect(commentsArray[0]).toMatchObject(firstCommentOnPage)
        });
    });
    test("400: when an invalid page limit is sent through, returns error", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=ten")
        .expect(400)
        .then((response) => {
          expect(response.body.message).toBe("Bad request.");
        });
    });
  });
  describe("Page query", () => {
    test("200: sends an array of the comments in the selected page, defaulting to a limit of 10 comments per page", () => {
      return request(app)
        .get("/api/articles/1/comments?page=1")
        .expect(200)
        .then((response) => {
          const commentsArray = response.body.comments;
          expect(commentsArray.length).toBe(10);
        });
    });
    test("404: when a non existent page query is sent through, returns error", () => {
      return request(app)
        .get("/api/articles/1/comments?page=5")
        .expect(404)
        .then((response) => {
          expect(response.body.message).toBe("Comment page for article not found.");
        });
    });
    test("400: when a page query of invalid data type is sent through, returns error", () => {
      return request(app)
        .get("/api/articles/1/comments?page=four")
        .expect(400)
        .then((response) => {
          expect(response.body.message).toBe("Bad request.");
        });
    });
  });
})

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

describe("GET /api/users/:username", () => {
  test("200: sends an array of correctly formatted users to the client", () => {
    return request(app)
      .get("/api/users/lurker")
      .expect(200)
      .then((response) => {
        const { user } = response.body;
        expect(user.length).toBe(1);
        expect(user[0]).toHaveProperty("username", expect.any(String));
        expect(user[0]).toHaveProperty("avatar_url", expect.any(String));
        expect(user[0]).toHaveProperty("name", expect.any(String));
      });
  });
  test("404: sends an appropriate status and error message when given a non existent username", () => {
    return request(app)
      .get("/api/users/lurkingeveryday")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("User not found.");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("201: updates votes on a specific comment based on the votes passed in", () => {
    const addVotes = { inc_votes: 63 };
    return request(app)
      .patch("/api/comments/4")
      .send(addVotes)
      .expect(200)
      .then((response) => {
        const { updatedComment } = response.body;
        expect(updatedComment[0]).toHaveProperty("body", expect.any(String));
        expect(updatedComment[0]).toHaveProperty("votes", expect.any(Number));
        expect(updatedComment[0].votes).toBe(-37);
      });
  });
  test("400: sends an appropriate status and error message when given an incorrect object key", () => {
    const badObject = { increase_votes: 63 };
    return request(app)
      .patch("/api/comments/4")
      .send(badObject)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad request.");
      });
  });
  test("400: sends an appropriate status and error message when given an object value of incorrect data type", () => {
    const badObject = { inc_votes: "sixty-three" };
    return request(app)
      .patch("/api/comments/4")
      .send(badObject)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad request.");
      });
  });
  test("404: sends an appropriate status and error message when given a valid but non-existent id", () => {
    const addVotes = { inc_votes: 63 };
    return request(app)
      .patch("/api/comments/9999999")
      .send(addVotes)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Comment not found.");
      });
  });
  test("400: sends an appropriate status and error message when given an id of invalid data type", () => {
    const badObject = { inc_votes: 63 };
    return request(app)
      .patch("/api/comments/four")
      .send(badObject)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad request.");
      });
  });
});

describe("POST /api/articles", () => {
  test("201: inserts new article to the array of articles and responds with the posted article", () => {
    const postArticle = {
      author: "butter_bridge",
      title: "Dark mode or light mode? A controversial topic.",
      body: "Light mode. I don't want to hear it",
      topic: "cats",
      article_img_url:
        "https://www.hp.com/us-en/shop/app/assets/images/uploads/prod/What%20is%20Dark%20Mode%20and%20How%20to%20Turn%20it%20On%20or%20Off1648514558189227.jpg",
    };
    return request(app)
      .post("/api/articles")
      .send(postArticle)
      .expect(201)
      .then((response) => {
        const newArticle = {
          author: "butter_bridge",
          title: "Dark mode or light mode? A controversial topic.",
          body: "Light mode. I don't want to hear it",
          topic: "cats",
          article_img_url:
            "https://www.hp.com/us-en/shop/app/assets/images/uploads/prod/What%20is%20Dark%20Mode%20and%20How%20to%20Turn%20it%20On%20or%20Off1648514558189227.jpg",
          article_id: 14,
          votes: 0,
        };
        expect(response.body.article.length).toBe(1);
        expect(response.body.article[0]).toMatchObject(newArticle);
        expect(response.body.article[0]).toHaveProperty(
          "created_at",
          expect.any(String)
        );
        expect(response.body.article[0]).toHaveProperty(
          "votes",
          expect.any(Number)
        );
        expect(response.body.article[0]).toHaveProperty(
          "comment_count",
          expect.any(String)
        );
      });
  });
  test("201: if no image_url is provided, defaults to a default url", () => {
    const postArticle = {
      author: "butter_bridge",
      title: "Dark mode or light mode? A controversial topic.",
      body: "Light mode. I don't want to hear it",
      topic: "cats",
    };
    return request(app)
      .post("/api/articles")
      .send(postArticle)
      .expect(201)
      .then((response) => {
        const newArticle = {
          author: "butter_bridge",
          title: "Dark mode or light mode? A controversial topic.",
          body: "Light mode. I don't want to hear it",
          topic: "cats",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          article_id: 14,
          votes: 0,
          comment_count: "0",
        };
        expect(response.body.article.length).toBe(1);
        expect(response.body.article[0]).toMatchObject(newArticle);
      });
  });
  test("201: if the given topic does not exist in topic list, creates new topic and posts the article as normal", () => {
    const postArticle = {
      author: "butter_bridge",
      title: "Dark mode or light mode? A controversial topic.",
      body: "Light mode. I don't want to hear it",
      topic: "coding",
    };
    return request(app)
      .post("/api/articles")
      .send(postArticle)
      .expect(201)
      .then((response) => {
        const newArticle = {
          author: "butter_bridge",
          title: "Dark mode or light mode? A controversial topic.",
          body: "Light mode. I don't want to hear it",
          topic: "coding",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          article_id: 14,
          votes: 0,
        };
        expect(response.body.article.length).toBe(1);
        expect(response.body.article[0]).toMatchObject(newArticle);
        expect(response.body.article[0]).toHaveProperty(
          "created_at",
          expect.any(String)
        );
        expect(response.body.article[0]).toHaveProperty(
          "votes",
          expect.any(Number)
        );
      });
  });
  test("400: responds with an appropriate status and error message when provided an article made by someone that is not an existing user", () => {
    const badObject = {
      author: "cheese-strings",
      title: "Dark mode or light mode? A controversial topic.",
      body: "Light mode. I don't want to hear it",
      topic: "cats",
      article_img_url:
        "https://www.hp.com/us-en/shop/app/assets/images/uploads/prod/What%20is%20Dark%20Mode%20and%20How%20to%20Turn%20it%20On%20or%20Off1648514558189227.jpg",
    };
    return request(app)
      .post("/api/articles")
      .send(badObject)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe(
          "User account does not exist. Please make an account."
        );
      });
  });
  test("400: responds with an appropriate status and error message when provided with a bad comment (missing required elements)", () => {
    const badObject = {
      author: "butter_bridge",
      title: "Dark mode or light mode? A controversial topic.",
      topic: "cats",
      article_img_url:
        "https://www.hp.com/us-en/shop/app/assets/images/uploads/prod/What%20is%20Dark%20Mode%20and%20How%20to%20Turn%20it%20On%20or%20Off1648514558189227.jpg",
    };
    return request(app)
      .post("/api/articles")
      .send(badObject)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad request.");
      });
  });
});

describe("POST /api/topics", () => {
  test("201: inserts new topic to the array of topics and responds with the posted topic", () => {
    const postTopic = {
      slug: "coding",
      description: "we luuuurve coding",
    };
    return request(app)
      .post("/api/topics")
      .send(postTopic)
      .expect(201)
      .then((response) => {
        const newTopic = {
          slug: "coding",
          description: "we luuuurve coding",
        };
        expect(response.body.topic.length).toBe(1);
        expect(response.body.topic[0]).toMatchObject(newTopic);
        expect(response.body.topic[0]).toHaveProperty(
          "slug",
          expect.any(String)
        );
        expect(response.body.topic[0]).toHaveProperty(
          "description",
          expect.any(String)
        );
      });
  });
  test("201: if an object is sent without a description, the topics object should still be created", () => {
    const postTopic = {
      slug: "coding",
    };
    return request(app)
      .post("/api/topics")
      .send(postTopic)
      .expect(201)
      .then((response) => {
        const newTopic = {
          slug: "coding",
        };
        expect(response.body.topic.length).toBe(1);
        expect(response.body.topic[0]).toMatchObject(newTopic);
        expect(response.body.topic[0]).toHaveProperty(
          "slug",
          expect.any(String)
        );
      });
  });
  test("400: returns error if bad object is passed in (i.e no slug)", () => {
    const badObject = {
      description: "we luuuurve coding",
    };
    return request(app)
      .post("/api/topics")
      .send(badObject)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad request.");
      });
  });
  test("400: returns error if the topic passed in already exists", () => {
    const postTopic = {
      slug: "cats",
      description: "not dogs",
    };
    return request(app)
      .post("/api/topics")
      .send(postTopic)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad request.");
      });
  });
});

describe("DELETE /api/articles/:article_id", () => {
  test("204: deletes article of the given article id, sends 'No content' to user", () => {
    return request(app)
      .delete("/api/articles/8")
      .expect(204)
      .then((response) => {
        expect(response.body).toEqual({});
      });
  });
  test("404: sends an appropriate status and error message when given a valid but non-existent id", () => {
    return request(app)
      .delete("/api/articles/999999")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Article not found.");
      });
  });
  test("400: sends an appropriate status and error message when given an id of invalid data type", () => {
    return request(app)
      .delete("/api/articles/eight")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad request.");
      });
  });
});
