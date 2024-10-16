const express = require("express");
const app = express();
const apiRouter = require("express").Router();
const { getTopics, getEndpoints } = require("./controllers/topics-controllers");
const {
  getArticleById,
  getArticles,
  getArticleComments,
  postComment,
  patchArticleById,
} = require("./controllers/articles-controllers");
const { deleteCommentById } = require("./controllers/comments-controllers");
const { getUsers } = require("./controllers/users-controllers");

app.use(express.json());

apiRouter.get("/", (req, res) => {
  res.status(200).send("All OK from /api");
})

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.patch("/api/articles/:article_id", patchArticleById)

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getArticleComments);

app.post("/api/articles/:article_id/comments", postComment);

app.delete("/api/comments/:comment_id", deleteCommentById)

app.get("/api/users", getUsers)
// ------------ ERROR MIDDLEWARE ---------------

app.all("/*", (request, response, next) => {
  response.status(404).send({ message: "Path not found." });
  next(err);
});

app.use((err, request, response, next) => {
  if (err.code === "23502" || err.code === "22P02" || err.status === 400) {
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
