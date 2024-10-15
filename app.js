const express = require("express");
const app = express();
const { getTopics, getEndpoints } = require("./controllers/topics-controllers");
const {
  getArticleById,
  getArticles,
  getArticleComments,
  postComment,
} = require("./controllers/articles-controllers");

app.use(express.json());

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getArticleComments);

app.post("/api/articles/:article_id/comments", postComment);

app.all("*", (request, response, next) => {
  response.status(404).send({ message: "Path not found." });
  next(err);
});

app.use((err, request, response, next) => {
  if (err.code === "23502" || err.code === "22P02") {
    response.status(400).send({ message: "Bad request." });
  }
  next(err);
});

app.use((err, request, response, next) => {
  if (err.status === 404) {
    response.status(404).send({ message: err.message });
  }
  next(err);
});

app.use((err, request, response, next) => {
  response.status(500).send({ message: "Internal Server Error." });
});

module.exports = app;
